package com.ecommerce.matessa.exceptionHandler;
import java.io.Serial;


public class ApisExceptionHandler extends RuntimeException{
    @Serial
    private static final long serialVersionUID = 1L;

    public ApisExceptionHandler() {
    }

public ApisExceptionHandler(String message ) {
        super(message);

}
}
