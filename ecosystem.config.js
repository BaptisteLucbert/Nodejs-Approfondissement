module.exports = {
  apps: [
    {
      name: "app",
      script: "./www/app.js",
      instances: 3, // 3 instances en parallèle
      exec_mode: "cluster", // Mode cluster pour gérer plusieurs instances
      max_memory_restart: "200M", // Redémarrer si l'utilisation mémoire dépasse 200 Mo
      error_file: "./logs/err.log", // Fichier de log pour les erreurs
      out_file: "./logs/out.log", // Fichier de log pour la sortie standard
      log_date_format: "YYYY-MM-DD HH:mm:ss Z", // Format de date pour les logs
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
