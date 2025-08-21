package org.example.usermanagement

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient

@SpringBootApplication
@EnableDiscoveryClient
class UserManagementApplication

fun main(args: Array<String>) {
    runApplication<UserManagementApplication>(*args)
}
