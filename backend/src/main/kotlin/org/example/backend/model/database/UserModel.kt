package org.example.backend.model.database

import jakarta.persistence.*
import org.jetbrains.annotations.NotNull

@Entity
@Table(name = "users")
class UserModel(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, unique = true)
    @NotNull
    var username: String,

    @Column(nullable = false)
    @NotNull
    var password: String,

    @Column(nullable = false, unique = true)
    @NotNull
    var email: String,

    @Column(nullable = false)
    @NotNull
    var name: String

    // TODO: Add other properties
)
