package com.example.trainy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrainyApplication {

	public static void main(String[] args) {

		SpringApplication.run(TrainyApplication.class, args);
	}

}
