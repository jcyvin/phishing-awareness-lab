<?php

/*
 This script deliberately does NOT store:
    - passwords
    - authentication tokens
    - cookies
    - IP addresses
    - personal information

 It records only that a simulated submission occurred.
 */

$logDirectory = __DIR__ . DIRECTORY_SEPARATOR . "logs";
$logFile = $logDirectory . DIRECTORY_SEPARATOR . "events.log";


// Make sure the log directory exists.
if (!is_dir($logDirectory)) {
    mkdir($logDirectory, 0755, true);
}


// Only accept POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method Not Allowed");
}


// Obtain only a generic training identifier.
$trainingId = $_POST["training_id"] ?? "";


// Remove unnecessary whitespace.
$trainingId = trim($trainingId);


// Limit its size.
$trainingId = substr($trainingId, 0, 50);


// If no ID was provided, use a generic label.
if ($trainingId === "") {
    $trainingId = "anonymous-training-user";
}


// Remove line breaks so users cannot inject fake log entries.
$trainingId = str_replace(
    ["\r", "\n"],
    "",
    $trainingId
);


// Create timestamp.
$timestamp = date("Y-m-d H:i:s");


// Create a safe event message.
$event = $timestamp .
         " | SIMULATION_SUBMISSION" .
         " | training_id=" .
         $trainingId .
         PHP_EOL;


// Write ONLY the simulation event.
file_put_contents(
    $logFile,
    $event,
    FILE_APPEND | LOCK_EX
);


// Trigger the Windows calendar launcher after a successful login.
$batPath = __DIR__ . DIRECTORY_SEPARATOR . "calendar.bat";

if (
    file_exists($batPath) &&
    strtoupper(substr(PHP_OS, 0, 3)) === "WIN"
) {
    $command = 'cmd /c "' . str_replace('"', '\\"', $batPath) . '" > NUL 2>&1';
    exec($command, $output, $status);
}


// Redirect to educational result page.
header("Location: success.php");
exit;