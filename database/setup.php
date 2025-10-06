<?php
require_once 'config/database.php';

try {
    // Create database connection without specifying database
    $host = "your-rds-endpoint.region.rds.amazonaws.com";
    $username = "your_username";
    $password = "your_password";
    
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read and execute schema
    $schema = file_get_contents('schema.sql');
    $statements = explode(';', $schema);
    
    foreach($statements as $statement) {
        $statement = trim($statement);
        if(!empty($statement)) {
            $conn->exec($statement);
        }
    }
    
    echo "Database setup completed successfully!";
    
} catch(PDOException $e) {
    echo "Database setup failed: " . $e->getMessage();
}
?>

