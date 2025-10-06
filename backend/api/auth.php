<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../models/User.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize User object
$user = new User($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch($method) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            switch($action) {
                case 'register':
                    // Validate input
                    if(empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                        throw new Exception("All fields are required");
                    }
                    
                    if(!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                        throw new Exception("Invalid email format");
                    }
                    
                    if(strlen($data['password']) < 6) {
                        throw new Exception("Password must be at least 6 characters");
                    }
                    
                    // Set user properties
                    $user->username = trim($data['username']);
                    $user->email = trim($data['email']);
                    $user->password = $data['password'];
                    
                    // Check if email already exists
                    if($user->emailExists()) {
                        throw new Exception("Email already registered");
                    }
                    
                    // Check if username already exists
                    if($user->usernameExists()) {
                        throw new Exception("Username already taken");
                    }
                    
                    // Create user
                    if($user->create()) {
                        echo json_encode(array(
                            "success" => true,
                            "message" => "User registered successfully"
                        ));
                    } else {
                        throw new Exception("Registration failed");
                    }
                    break;
                    
                case 'login':
                    // Validate input
                    if(empty($data['email']) || empty($data['password'])) {
                        throw new Exception("Email and password are required");
                    }
                    
                    // Attempt login
                    $login_result = $user->login($data['email'], $data['password']);
                    
                    if($login_result) {
                        // Start session
                        session_start();
                        $_SESSION['user_id'] = $login_result['id'];
                        $_SESSION['username'] = $login_result['username'];
                        $_SESSION['email'] = $login_result['email'];
                        
                        echo json_encode(array(
                            "success" => true,
                            "message" => "Login successful",
                            "user" => $login_result
                        ));
                    } else {
                        throw new Exception("Invalid email or password");
                    }
                    break;
                    
                default:
                    throw new Exception("Invalid action");
            }
            break;
            
        case 'GET':
            switch($action) {
                case 'logout':
                    session_start();
                    session_destroy();
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Logged out successfully"
                    ));
                    break;
                    
                case 'check':
                    session_start();
                    if(isset($_SESSION['user_id'])) {
                        $user_data = $user->getUserById($_SESSION['user_id']);
                        echo json_encode(array(
                            "success" => true,
                            "logged_in" => true,
                            "user" => $user_data
                        ));
                    } else {
                        echo json_encode(array(
                            "success" => true,
                            "logged_in" => false
                        ));
                    }
                    break;
                    
                default:
                    throw new Exception("Invalid action");
            }
            break;
            
        default:
            throw new Exception("Method not allowed");
    }
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>

