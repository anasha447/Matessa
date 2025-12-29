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

        // Convert List<User> to List<UserDTO>
        // This automatically maps fields like 'image' if they exist in both classes
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public String deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));

        // Optional: If you want to delete the user's profile image from the disk
        // you would use FileService here.
        // String imagePath = "images/" + user.getImage();
        // File file = new File(imagePath);
        // if(file.exists()) file.delete();

        userRepository.delete(user);
        return "User with ID " + userId + " deleted successfully.";
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "userId", userId));

        // Update basic fields
        // Note: For Password update, usually we have a separate endpoint
        if (userDTO.getUserName() != null) user.setUserName(userDTO.getUserName());
        // Email update might require verification, skipping for now or allow it
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());

        // Save
        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, UserDTO.class);
    }
}