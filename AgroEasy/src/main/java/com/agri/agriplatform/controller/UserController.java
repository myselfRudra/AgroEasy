package com.agri.agriplatform.controller;

import com.agri.agriplatform.entity.User;
import com.agri.agriplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")

public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestParam String phone,
            @RequestParam String password) {

        User user = service.login(phone, password);
        if (user != null)
            return "Login Success";
        else
            return "Invalid Credentials";
    }

}
