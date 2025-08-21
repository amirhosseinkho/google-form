package org.example.backend.model.database

import jakarta.persistence.*

@Entity
@Table(name = "group_members")
data class GroupMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val groupId: Long,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val joinedAt: String = java.time.LocalDateTime.now().toString()
) 