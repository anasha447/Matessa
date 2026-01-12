package com.ecommerce.matessa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync // <--- ADD THIS
@SpringBootApplication
public class MatessaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MatessaApplication.class, args);
	}

}
