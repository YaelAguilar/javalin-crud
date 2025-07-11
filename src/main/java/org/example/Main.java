package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import org.example.configs.AppConfig;
import org.example.configs.DbConfig;
import org.example.configs.ExceptionHandlerConfig; // <-- Importar el manejador de excepciones
import org.example.controllers.BookController;     // <-- Importar el controlador
import org.example.daos.IBookDAO;                 // <-- Importar la interfaz DAO
import org.example.daos.impl.BookDAO;             // <-- Importar la implementación DAO
import org.example.mappers.BookMapper;           // <-- Importar el mapper
import org.example.routes.BookRoutes;             // <-- Importar las rutas
import org.example.services.BookService;         // <-- Importar el servicio

import java.util.Map;

public class Main {
    public static void main(String[] args) {
        DbConfig.init(); // Inicializa la conexión a BD y crea la tabla 'books'

        // --- Inyección de Dependencias Manual para el CRUD de Libros ---
        IBookDAO bookDAO = new BookDAO();
        BookMapper bookMapper = new BookMapper();
        BookService bookService = new BookService(bookDAO, bookMapper);
        BookController bookController = new BookController(bookService);
        BookRoutes bookRoutes = new BookRoutes(bookController);

        ObjectMapper jacksonMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(jacksonMapper));
            config.plugins.enableCors(cors -> cors.add(it -> {
                it.anyHost(); // Permite peticiones de cualquier origen (para desarrollo)
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