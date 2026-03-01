package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.User;
import com.ecommerce.matessa.payLoad.UserDTO;
import com.ecommerce.matessa.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(user -> {
            // 1. Map basic fields
            UserDTO dto = modelMapper.map(user, UserDTO.class);

            // 2. FORCE Role Mapping (Fixes the "Empty Roles" issue)
            List<String> roles = user.getRoles().stream()
                    .map(role -> role.getRoleName().name())
                    .collect(Collectors.toList());
            dto.setRoles(roles);

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));

        // 1. Map basic fields
        UserDTO dto = modelMapper.map(user, UserDTO.class);

        // 2. FORCE Role Mapping
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());
        dto.setRoles(roles);

        return dto;
    }

    @Override
    public String deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));

        userRepository.delete(user);
        return "User with ID " + userId + " deleted successfully.";
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));

        // Update fields if they are not null
        if (userDTO.getUserName() != null) user.setUserName(userDTO.getUserName());
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());

        // NOTE: Never update Password or Roles here directly for security reasons.
        // Create specific endpoints for changing passwords or promoting admins.

        User updatedUser = userRepository.save(user);

        // Return mapped DTO with roles
        UserDTO responseDto = modelMapper.map(updatedUser, UserDTO.class);
        responseDto.setRoles(user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList()));

        return responseDto;
    }
}