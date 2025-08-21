package org.example.formsubmission

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient

@SpringBootApplication
@EnableDiscoveryClient
class FormSubmissionApplication

fun main(args: Array<String>) {
    runApplication<FormSubmissionApplication>(*args)
}
