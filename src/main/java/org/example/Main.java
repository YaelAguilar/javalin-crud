package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import org.example.configs.AppConfig;
import org.example.configs.DbConfig;
import org.example.configs.ExceptionHandlerConfig;
import org.example.routes.BookRoutes;

import java.util.Map;

public class Main {
    public static void main(String[] args) {
        DbConfig.init(); 

        BookRoutes bookRoutes = DependencyInjector.getBookRoutes();

        ObjectMapper jacksonMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(jacksonMapper));
            
            // --- IMPLEMENTACIÓN DE CORS ---
            config.plugins.enableCors(cors -> cors.add(it -> {
                it.anyHost(); // Permite peticiones de CUALQUIER origen (*)
                /*
                *it.allowedOrigins("http://localhost:3000", "https://tuedominiofrontend.com", "https://otrodminio.net");
                *it.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"); // Métodos HTTP permitidos
                *it.allowedHeaders("Content-Type", "Authorization"); // Cabeceras permitidas en las peticiones
                *it.allowCredentials = true; // Permite el envío de cookies de autenticación, si se usan
                *it.exposeHeader("Authorization"); // Expone cabeceras de respuesta que el cliente JS puede leer 
                */
            }));
            // --- FIN DE IMPLEMENTACIÓN DE CORS ---

                config.plugins.enableDevLogging();
        });

        ExceptionHandlerConfig.register(app); 

        bookRoutes.register(app);

        app.get("/", ctx -> ctx.json(Map.of(
            "status", "Ok",
            "message", "¡La plantilla CRUD está funcionando!"
        )));

        setupShutdownHook(app);

        app.start(AppConfig.getServerHost(), AppConfig.getServerPort());
        
        System.out.println("Servidor iniciado en http://" + AppConfig.getServerHost() + ":" + AppConfig.getServerPort());
    }

    private static void setupShutdownHook(Javalin app) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Cerrando la aplicación...");
            DbConfig.close();
            app.stop();
            System.out.println("Aplicación cerrada de forma segura.");
        }));
    }
}