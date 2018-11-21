<?php
$config = include('../config.php');

// Create connection
$conn = new mysqli($config['host'], $config['username'], $config['password'],$config['database']);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
return $conn; 
?>