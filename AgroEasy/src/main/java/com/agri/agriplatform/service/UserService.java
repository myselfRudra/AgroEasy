package com.agri.agriplatform.service;

import com.agri.agriplatform.entity.User;
import com.agri.agriplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public User register(User user) {
        return repo.save(user);
    }

    public User login(String phone, String password) {
        return repo.findByPhone(phone)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

}
