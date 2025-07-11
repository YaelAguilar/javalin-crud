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
        DbConfig.init(); // Inicializa la conexión a BD y crea la tabla 'books'

        // --- Inyección de Dependencias a través del inyector ---
        BookRoutes bookRoutes = DependencyInjector.getBookRoutes();

        ObjectMapper jacksonMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(jacksonMapper));
            config.plugins.enableCors(cors -> cors.add(it -> {
                it.anyHost();
            }));
                config.plugins.enableDevLogging();
        });

        // --- Registrar el manejador de excepciones global ---
        ExceptionHandlerConfig.register(app); 

        // --- Registrar las rutas del recurso Book ---
        bookRoutes.register(app);

        // Endpoint de prueba (Bienvenida)
        app.get("/", ctx -> ctx.json(Map.of(
            "status", "Ok",
            "message", "¡La plantilla CRUD está funcionando!"
        )));

        // Configurar un "shutdown hook" para cerrar recursos de forma segura
        setupShutdownHook(app);

        // Iniciar el servidor
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