package com.ayursutra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AyurSutraApplication {

	public static void main(String[] args) {

		SpringApplication.run(AyurSutraApplication.class, args);
	}

}
