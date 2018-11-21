<?php 
include('../dbconn.php');
$validationError = '';
if(isset($_POST['loginForm'])){
	$userName = $_POST['uname'];
	$password = $_POST['pass'];
	$query = 'select * from admin where name="'.$userName.'" AND password="'.$password.'"';
	$result = $conn->query($query);
	if($result->num_rows  > 0){
		session_start();
		$row = $result->fetch_array();
		$_SESSION['admin_id'] = $row['id'];
		header('location:users.php');
	}else{
		$validationError = 'Invalid User Name and Passowrd';
	}
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

	<title>QuoteEasy | Smart Quotations For You</title>

	<meta name="description" content="">
	<meta name="author" content="R2R">

	<!-- Bootstrap core CSS -->
	<link rel="stylesheet" href="../assets/css/bootstrap/bootstrap.css" /> 
	
    <!-- Fonts  -->
    <link href='http://fonts.googleapis.com/css?family=Raleway:400,500,600,700,300' rel='stylesheet' type='text/css'>
    
    <!-- Base Styling  -->
    <link rel="stylesheet" href="../assets/css/app/app.v1.css" />
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
</head>
<body>
    <!-- Preloader -->
    <div id="login_container">
		<div class="container">
    	<div class="row">
    	<div class="col-lg-4 col-lg-offset-4">
        	<h3 class="text-center">Sign in to continue</h3>
            
            <hr class="clean">
        	<form method="post" action="" >
              <div class="form-group input-group">
              	<span class="input-group-addon"><i class="fa fa-envelope"></i></span>
                <input type="text" name = "uname" class="form-control"  placeholder="User Name">
              </div>
              <div class="form-group input-group">
              	<span class="input-group-addon"><i class="fa fa-key"></i></span>
                <input type="password" name="pass" class="form-control"  placeholder="Password">
              </div>
        	  <input type="submit" class="btn btn-purple btn-block" id="signin" value="Sign in" name="loginForm"/>
			  <?php echo $validationError;?>
            </form>
            <hr>
        </div>
        </div>
    </div>
	</div>
</body>
</html>
