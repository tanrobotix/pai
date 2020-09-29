process.on('unhandledRejection', function(reason, p){
    logger.error(`Encounter unhandled rejection of promise, reason: ${reason}`,
      function() {
        process.exit(1);
      }
    );
});
