package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.example.configs.AppConfig;
import org.example.configs.DbConfig;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // 1. Inicializar la configuración de la base de datos
        DbConfig.init();

        // 2. Configurar el mapeador de JSON
        ObjectMapper jacksonMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        // 3. Crear y configurar la instancia de Javalin
        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(jacksonMapper));
            config.plugins.enableCors(cors -> cors.add(it -> {
                it.anyHost();
            }));
                config.plugins.enableDevLogging();
        });

        // 4. Definir un endpoint de prueba
        app.get("/", ctx -> ctx.json(Map.of(
            "status", "Ok",
            "message", "¡La plantilla CRUD está funcionando!"
        )));

        // 5. Configurar un "shutdown hook" para cerrar recursos de forma segura
        setupShutdownHook(app);

        // 6. Iniciar el servidor
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