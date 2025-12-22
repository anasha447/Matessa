package com.ecommerce.matessa.configs;


import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
@Bean
    public OpenAPI customOpenAPI() {
    SecurityScheme bearerScheme = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP).scheme("bearer")
            .bearerFormat("JWT")
            .description("Bearer Token");
    SecurityRequirement bearerRequirement = new SecurityRequirement()
            .addList("Bearer Authentication");

    return new OpenAPI()

            .info(new Info()
                    .title("Springboot E-commerce APIs ")
                    .description("Springboot APIs for Matessa E-commerce ")
                    .version("1.0")
                    .termsOfService("https://github.com/Matessa")
                    .contact( new Contact()
                            .name("Anas Habib")
                            .email("anashabib0101@gmail.com"))
            )

            .components(new Components()
                    .addSecuritySchemes("Bearer Authentication", bearerScheme))
                    .addSecurityItem(bearerRequirement);

}


}
