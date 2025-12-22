package com.ecommerce.matessa.exceptionHandler;

public class ResourceExceptionHandler extends  RuntimeException {

    String resourceName;
    String fieldName;
    String field;
    Long id;

    public ResourceExceptionHandler(String s) {
    }

    public ResourceExceptionHandler(String resourceName, String fieldName, String field) {
        super(String.format("Resource '%s' Not found %s: %s", resourceName, fieldName, field));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.field = field;
    }

    public ResourceExceptionHandler(String resourceName, String fieldName, Long id) {
        super(String.format("Resource '%s' Not found %s: %d", resourceName, fieldName, id));

        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.id = id;
    }
}
