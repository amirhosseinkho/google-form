package org.example.formmanagement

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient

@SpringBootApplication
@EnableDiscoveryClient
class FormManagementApplication

fun main(args: Array<String>) {
    runApplication<FormManagementApplication>(*args)
}
