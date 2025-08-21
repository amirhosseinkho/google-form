import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Switch, message, DatePicker, Card, Space, Typography } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import moment from 'moment';
import { apiGet, apiPost, apiPut } from '../api/apiUtils';

const { Option } = Select;
const { Title, Text } = Typography;

interface Field {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  defaultValue?: string | number | string[];
  placeholder?: string;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  options?: string[];
  errors?: string[];
}

const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found in localStorage');
  }
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
};

export default function FormBuilderPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const fieldTypes = ['text', 'textarea', 'number', 'date', 'dropdown', 'checkbox', 'radio'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (id) {
      apiGet(`/forms/${id}`)
        .then(data => {
          if (data) {
            setFormTitle(data.name);
            setFormDescription(data.description || '');
            setFields(data.fields || []);
          }
        })
        .catch(() => message.error('Failed to load form'));
    } else {
      // Add a default field for new forms
      const defaultField: Field = {
        id: uuidv4(),
        type: 'text',
        label: 'Sample Field',
        required: false,
        defaultValue: undefined, // Explicitly set to undefined
        placeholder: 'Enter your text here',
        options: undefined,
      };
      setFields([defaultField]);
    }
  }, [id, navigate]);

  const addField = () => {
    const newField: Field = {
      id: uuidv4(),
      type: 'text',
      label: `Field ${fields.length + 1}`,
      required: false,
      defaultValue: undefined, // Explicitly set to undefined to avoid any default values
      placeholder: '',
      options: undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(field => {
      if (field.id !== id) return field;
      const updatedField = { ...field, ...updates };
      updatedField.errors = validateField(updatedField);
      return updatedField;
    }));
  };

  const validateField = (field: Field): string[] => {
    const errors: string[] = [];
    if (!field.label || field.label.length > 100) {
      errors.push('Label must be 1-100 characters');
    }
    if (['dropdown', 'checkbox', 'radio'].includes(field.type)) {
      if (!field.options || field.options.length < 2) {
        errors.push('At least 2 options required');
      }
    }
    if (field.type === 'number' && field.defaultValue) {
      const value = Number(field.defaultValue);
      if (field.min !== undefined && value < field.min) {
        errors.push(`Value must be at least ${field.min}`);
      }
      if (field.max !== undefined && value > field.max) {
        errors.push(`Value must be at most ${field.max}`);
      }
    }
    if (field.type === 'date' && field.defaultValue) {
      const date = moment(field.defaultValue);
      if (field.minDate && date.isBefore(moment(field.minDate))) {
        errors.push(`Date must be after ${field.minDate}`);
      }
      if (field.maxDate && date.isAfter(moment(field.maxDate))) {
        errors.push(`Date must be before ${field.maxDate}`);
      }
    }
    return errors;
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedFields = Array.from(fields);
    const [moved] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, moved);
    setFields(reorderedFields);
  };

  const onFinish = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('You must be logged in to create a form');
      navigate('/login');
      return;
    }
    if (fields.length === 0) {
      message.error('At least one field is required');
      return;
    }
    if (!formTitle.trim()) {
      message.error('Form title is required');
      return;
    }
    const invalidFields = fields.filter(field => validateField(field).length > 0);
    if (invalidFields.length > 0) {
      message.error('Please correct invalid field configurations');
      setFields(fields.map(field => ({ ...field, errors: validateField(field) })));
      return;
    }
    try {
      console.log('Fields before sending:', fields);
      console.log('Fields length:', fields.length);
      
      const formData = {
        name: formTitle,
        description: formDescription || 'No description provided',
        createdBy: localStorage.getItem('userEmail') || localStorage.getItem('userName') || 'Unknown Creator',
        fields: fields.map(field => ({
          id: field.id,
          type: field.type,
          label: field.label,
          required: field.required,
          defaultValue: field.defaultValue,
          placeholder: field.placeholder,
          options: field.options,
          min: field.min,
          max: field.max,
          minDate: field.minDate,
          maxDate: field.maxDate
        }))
      };
      
      console.log('Fields array:', fields);
      console.log('Fields length:', fields.length);
      console.log('Mapped fields:', formData.fields);
      console.log('Mapped fields length:', formData.fields.length);
      
      console.log('Form data to send:', formData);
      
      let savedForm;
      if (id) {
        // Update existing form
        savedForm = await apiPut(`/forms/${id}`, formData);
      } else {
        // Create new form
        savedForm = await apiPost('/forms', formData);
      }
      
      console.log('Saved form:', savedForm);
      message.success(`Form ${id ? 'updated' : 'created'} successfully!`);
      // Force refresh of forms page
      navigate('/forms', { replace: true });
      // Trigger a page reload to refresh forms
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Form save error:', error);
      message.error('Failed to save form. Try again.');
    }
  };

  const renderPreview = (field: Field) => {
    switch (field.type) {
      case 'text':
      case 'textarea':
        return <Input placeholder={field.placeholder} defaultValue={field.defaultValue as string} disabled className="w-full rounded-lg" />;
      case 'number':
        return <Input type="number" min={field.min} max={field.max} defaultValue={field.defaultValue as number} disabled className="w-full rounded-lg" />;
      case 'date':
        return <DatePicker defaultValue={field.defaultValue ? moment(field.defaultValue) : undefined} disabled className="w-full rounded-lg" />;
      case 'dropdown':
        return (
          <Select defaultValue={field.defaultValue as string} disabled className="w-full rounded-lg">
            {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        );
      case 'checkbox':
        return (
          <Space direction="vertical">
            {field.options?.map(opt => (
              <div key={opt}>
                <input type="checkbox" disabled checked={(field.defaultValue as string[])?.includes(opt)} />
                <span className="ml-2">{opt}</span>
              </div>
            ))}
          </Space>
        );
      case 'radio':
        return (
          <Space direction="vertical">
            {field.options?.map(opt => (
              <div key={opt}>
                <input type="radio" disabled checked={field.defaultValue === opt} />
                <span className="ml-2">{opt}</span>
              </div>
            ))}
          </Space>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">{id ? 'Edit Form' : 'Create New Form'}</h1>
            <Card className="shadow-2xl rounded-2xl p-8 bg-white transform hover:shadow-3xl transition duration-300">
              <Form form={form} layout="vertical" className="space-y-6">
                <Form.Item label={<span className="text-lg font-semibold text-indigo-700">Form Title</span>} required>
                  <Input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Enter form title"
                    className="text-lg border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                  />
                </Form.Item>
                <Form.Item label={<span className="text-lg font-semibold text-indigo-700">Form Description</span>}>
                  <Input.TextArea
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Enter form description (optional)"
                    rows={3}
                    className="text-lg border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                  />
                </Form.Item>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4 border border-indigo-200 hover:shadow-lg transition duration-300 rounded-xl bg-white"
                                title={
                                  <Space>
                                    <span className="text-indigo-600 cursor-move">⋮⋮</span>
                                    <Text strong className="text-indigo-800">{field.label || 'Untitled Field'}</Text>
                                  </Space>
                                }
                                extra={<Button danger icon={<span className="text-red-500">×</span>} onClick={() => removeField(field.id)} className="hover:text-red-700" />}
                              >
                                <Form layout="vertical" className="space-y-4">
                                  <Form.Item label="Label" validateStatus={field.errors?.includes('Label must be 1-100 characters') ? 'error' : ''} help={field.errors?.includes('Label must be 1-100 characters') ? 'Label must be 1-100 characters' : ''}>
                                    <Input
                                      value={field.label}
                                      onChange={e => updateField(field.id, { label: e.target.value })}
                                      placeholder="Enter field label"
                                      className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                    />
                                  </Form.Item>
                                  <Form.Item label="Field Type">
                                    <Select
                                      value={field.type}
                                      onChange={type => {
                                        const newType = type as Field['type'];
                                        let newOptions = undefined;
                                        let newDefaultValue = undefined;
                                        
                                        if (['dropdown', 'checkbox', 'radio'].includes(newType)) {
                                          newOptions = ['Option 1', 'Option 2'];
                                          // Clear default value when switching to option-based fields
                                          newDefaultValue = undefined;
                                        } else if (newType === 'number') {
                                          // Clear default value for number fields
                                          newDefaultValue = undefined;
                                        } else if (newType === 'date') {
                                          // Clear default value for date fields
                                          newDefaultValue = undefined;
                                        } else {
                                          // Clear default value for text fields
                                          newDefaultValue = undefined;
                                        }
                                        
                                        updateField(field.id, { 
                                          type: newType, 
                                          defaultValue: newDefaultValue, 
                                          options: newOptions 
                                        });
                                      }}
                                      className="w-full rounded-lg"
                                    >
                                      {fieldTypes.map(type => (
                                        <Option key={type} value={type}>
                                          {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item label="Required">
                                    <Switch
                                      checked={field.required}
                                      onChange={checked => updateField(field.id, { required: checked })}
                                      className="bg-indigo-200"
                                    />
                                  </Form.Item>
                                  {(field.type === 'text' || field.type === 'textarea') && (
                                    <Form.Item label="Placeholder">
                                      <Input
                                        value={field.placeholder}
                                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                                        placeholder="Enter placeholder text"
                                        className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                      />
                                    </Form.Item>
                                  )}
                                  <Form.Item label="Default Value" validateStatus={field.errors?.some(e => e.includes('Value must be')) ? 'error' : ''} help={field.errors?.find(e => e.includes('Value must be'))}>
                                    {field.type === 'date' ? (
                                      <DatePicker
                                        value={field.defaultValue ? moment(field.defaultValue) : undefined}
                                        onChange={date => updateField(field.id, { defaultValue: date ? date.format('YYYY-MM-DD') : undefined })}
                                        className="w-full border-indigo-300 focus:border-indigo-500 rounded-lg"
                                      />
                                    ) : field.type === 'number' ? (
                                      <Input
                                        type="number"
                                        value={field.defaultValue as number}
                                        onChange={e => updateField(field.id, { defaultValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                      />
                                    ) : ['dropdown', 'radio'].includes(field.type) ? (
                                      <Select
                                        value={field.defaultValue as string}
                                        onChange={value => updateField(field.id, { defaultValue: value })}
                                        className="w-full rounded-lg"
                                      >
                                        {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                                      </Select>
                                    ) : field.type === 'checkbox' ? (
                                      <Select
                                        mode="multiple"
                                        value={field.defaultValue as string[]}
                                        onChange={value => updateField(field.id, { defaultValue: value })}
                                        className="w-full rounded-lg"
                                      >
                                        {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                                      </Select>
                                    ) : (
                                      <Input
                                        value={field.defaultValue as string}
                                        onChange={e => updateField(field.id, { defaultValue: e.target.value })}
                                        className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                      />
                                    )}
                                  </Form.Item>
                                  {field.type === 'number' && (
                                    <>
                                      <Form.Item label="Minimum Value">
                                        <Input
                                          type="number"
                                          value={field.min}
                                          onChange={e => updateField(field.id, { min: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                        />
                                      </Form.Item>
                                      <Form.Item label="Maximum Value">
                                        <Input
                                          type="number"
                                          value={field.max}
                                          onChange={e => updateField(field.id, { max: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                        />
                                      </Form.Item>
                                    </>
                                  )}
                                  {field.type === 'date' && (
                                    <>
                                      <Form.Item label="Minimum Date" validateStatus={field.errors?.some(e => e.includes('Date must be after')) ? 'error' : ''} help={field.errors?.find(e => e.includes('Date must be after'))}>
                                        <DatePicker
                                          value={field.minDate ? moment(field.minDate) : undefined}
                                          onChange={date => updateField(field.id, { minDate: date ? date.format('YYYY-MM-DD') : undefined })}
                                          className="w-full border-indigo-300 focus:border-indigo-500 rounded-lg"
                                        />
                                      </Form.Item>
                                      <Form.Item label="Maximum Date" validateStatus={field.errors?.some(e => e.includes('Date must be before')) ? 'error' : ''} help={field.errors?.find(e => e.includes('Date must be before'))}>
                                        <DatePicker
                                          value={field.maxDate ? moment(field.maxDate) : undefined}
                                          onChange={date => updateField(field.id, { maxDate: date ? date.format('YYYY-MM-DD') : undefined })}
                                          className="w-full border-indigo-300 focus:border-indigo-500 rounded-lg"
                                        />
                                      </Form.Item>
                                    </>
                                  )}
                                  {['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                                    <Form.Item
                                      label="Options (comma-separated)"
                                      validateStatus={field.errors?.includes('At least 2 options required') ? 'error' : ''}
                                      help={field.errors?.includes('At least 2 options required') ? 'At least 2 options required' : ''}
                                    >
                                      <Input
                                        value={field.options?.join(', ')}
                                        onChange={e => updateField(field.id, { options: e.target.value ? e.target.value.split(',').map(opt => opt.trim()) : [] })}
                                        placeholder="e.g., Option 1, Option 2, Option 3"
                                        className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2"
                                      />
                                    </Form.Item>
                                  )}
                                  <div className="mt-6">
                                    <Text strong className="text-indigo-700">Preview:</Text>
                                    <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-200">{renderPreview(field)}</div>
                                  </div>
                                </Form>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <Space className="mt-6 w-full justify-center">
                  <Button
                    onClick={addField}
                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition duration-300"
                    icon={<span className="text-indigo-600">+</span>}
                  >
                    Add New Field
                  </Button>
                </Space>
                <Space className="mt-8 w-full justify-end">
                  <Button onClick={() => navigate('/forms')} className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition duration-300">Cancel</Button>
                  <Button
                    type="primary"
                    onClick={onFinish}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                  >
                    {id ? 'Update Form' : 'Create Form'}
                  </Button>
                </Space>
              </Form>
            </Card>
          </div>
  );
}

