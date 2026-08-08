package com.ayursutra.entity;

import com.ayursutra.constant.Role;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "users")
public class User extends BaseEntity {

    private String fullName;

    private String email;

    private String password;

    private String phone;

    private Role role;

    private boolean enabled;

}