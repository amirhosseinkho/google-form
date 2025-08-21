type Form = {
    id: string;
    title: string;
    status: string;
    lastModified: string;
};

type FieldSchema = {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    maxLength?: number;
};

type User = {
    id: number;
    username: string;
    password: string;
    role: "admin" | "user";
    level?: string;
};

// Mock data for forms
let forms: Form[] = [
    {id: "1", title: "Customer Feedback", status: "Active", lastModified: "2024-03-15"},
    {id: "2", title: "Employee Survey", status: "Inactive", lastModified: "2024-03-10"},
];

// Mock data for users
let users: User[] = [
    {id: 1, username: "admin@g.com", password: "adminadmin", role: "admin"},
    {id: 2, username: "user@g.com", password: "useruser", role: "user"},
    {id: 3, username: "p@g.com", password: "111111", role: "user"},
];

// Association of user IDs to accessible forms
const userFormPermissions: Record<number, string[]> = {
    1: ["1", "2"], // Admin user can access both forms
    2: ["1"],      // Regular user can access only form "1"
    3: ["2"],      // Another regular user can access only form "2"
};

// Detailed mock fields for forms
const formSchemas: Record<string, FieldSchema[]> = {
    "1": [
        {id: "fullName", label: "Full Name", type: "text", required: true, maxLength: 10},
        {id: "email", label: "Email Address", type: "text", required: true},
        {id: "age", label: "Age", type: "number", required: false, min: 18, max: 100},
        {id: "feedback", label: "Feedback", type: "textarea", required: true},
        {id: "visitDate", label: "Date of Visit", type: "date", required: true},
        {
            id: "rating",
            label: "Service Rating",
            type: "radio",
            required: true,
            options: ["Excellent", "Good", "Fair", "Poor"]
        },
        {
            id: "servicesUsed",
            label: "Services Used",
            type: "checkbox",
            required: false,
            options: ["Delivery", "Pickup", "In-store"]
        },
        {
            id: "recommendation",
            label: "Would you recommend us?",
            type: "dropdown",
            required: true,
            options: ["Yes", "No", "Maybe"]
        },
    ],
    "2": [
        {id: "employeeId", label: "Employee ID", type: "text", required: true},
        {
            id: "department",
            label: "Department",
            type: "dropdown",
            required: true,
            options: ["HR", "IT", "Finance", "Marketing"]
        },
        {
            id: "satisfaction",
            label: "Job Satisfaction",
            type: "radio",
            required: true,
            options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"]
        },
        {id: "comments", label: "Additional Comments", type: "textarea", required: false},
    ],
};

interface Submission {
    id: string;
    formTitle: string;
    submittedAt: string;
    status: string;
}

let submissionsStore: Record<number, Submission[]> = {};

export const mockApi = {
    getForms: async () => {
        return new Promise<Form[]>((resolve) => setTimeout(() => resolve(forms), 1000));
    },

    getForm: async (id: string) => {
        return forms.find((f) => f.id === id);
    },

    getFormById: async (formId: string) => {
        return new Promise<FieldSchema[]>((resolve, reject) => {
            setTimeout(() => {
                const schema = formSchemas[formId];
                if (schema) {
                    resolve(schema);
                } else {
                    reject(new Error("Form schema not found"));
                }
            }, 1000);
        });
    },

    // submitForm: async (formId: string, data: any) => {
    //     return new Promise<{ success: boolean }>((resolve) => {
    //         setTimeout(() => {
    //             console.log("Form Submitted:", formId, data);
    //             resolve({success: true});
    //         }, 1000);
    //     });
    // },

    register: async (username: string, password: string, level?: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (users.find((u) => u.username === username))
                    reject(new Error("User exists"));
                else {
                    const newUser: User = {
                        id: users.length + 1,
                        username,
                        password,
                        role: "user",
                        level,
                    };
                    users.push(newUser);
                    resolve({...newUser, token: "mock-token"});
                }
            }, 2000);
        });
    },

    // New method to fetch allowed forms for a user
    getUserAllowedForms: async (userId: number) => {
        // Mock data
        return Promise.resolve([
            {id: "1", title: "Survey Form", status: "Active"},
            {id: "2", title: "Feedback Form", status: "Inactive"},
            // {id: "3", title: "Registration Form", status: "Active"},
        ]);
    },
    getFormSubmissions: async (formId: string) => {
        return Promise.resolve([
            {id: "sub1", submitterName: "John Doe", submittedAt: "2024-05-20"},
            {id: "sub2", submitterName: "Jane Smith", submittedAt: "2024-05-21"},
        ]);
    },

    deleteSubmission: async (formId: string, submissionId: string) => {
        console.log(`Deleting submission ${submissionId} from form ${formId}`);
        return Promise.resolve();
    },
    // getMySubmissions: async (userId: number) => {
    //     return Promise.resolve([
    //         {
    //             id: "sub123",
    //             formTitle: "Customer Feedback",
    //             submittedAt: "2024-05-20",
    //             status: "Accepted",
    //         },
    //         {
    //             id: "sub124",
    //             formTitle: "Event Registration",
    //             submittedAt: "2024-05-21",
    //             status: "Removed by Owner",
    //         },
    //     ]);
    // },

    submitForm: async (formId: string, values: any) => {
        const userId = Number(localStorage.getItem("userId"));
        const submission: Submission = {
            id: `${Date.now()}`,
            formTitle: `Form ${formId}`,
            submittedAt: new Date().toISOString(),
            status: "Active",
        };

        if (!submissionsStore[userId]) submissionsStore[userId] = [];
        submissionsStore[userId].push(submission);
        return Promise.resolve();
    },


    getMySubmissions: async (userId: number) => {
        return Promise.resolve(submissionsStore[userId] || []);
    },

    deleteMySubmission: async (submissionId: string) => {
        const userId = Number(localStorage.getItem("userId"));
        submissionsStore[userId] = submissionsStore[userId].filter(
            (submission) => submission.id !== submissionId
        );
        return Promise.resolve();
    },

    getProfile: async () => {
        return Promise.resolve({
            name: "John Doe",
            email: "john@example.com",
        });
    },

    updateProfile: async (data: { name: string }) => {
        console.log("Updating profile:", data);
        return Promise.resolve();
    },

    deleteAccount: async () => {
        console.log("Deleting account");
        return Promise.resolve();
    },

};
