<?php
session_start();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if ($username === 'admin' && $password === 'admin123') {
        $_SESSION['admin'] = true;
        header('Location: admin.php');
        exit;
    } else {
        $error = "Неверное имя пользователя или пароль";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      background: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      color: #333;
    }
    .login-container h1 {
      text-align: center;
    }
    .login-container form div {
      margin-bottom: 15px;
    }
    .login-container label {
      display: block;
      margin-bottom: 5px;
    }
    .login-container input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    .login-container button {
      width: 100%;
      padding: 10px;
      background: #4F5900;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .error {
      color: red;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>Login</h1>
    <?php if ($error): ?>
      <p class="error"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>
    <form method="post" action="">
      <div>
        <label for="username">Имя пользователя:</label>
        <input type="text" name="username" id="username" required>
      </div>
      <div>
        <label for="password">Пароль:</label>
        <input type="password" name="password" id="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</body>
</html>
