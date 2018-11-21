<?php 
	include('../dbconn.php');
	include('header.php');
	include('sidebar.php');
	$query = 'select * from users';
	$result = $conn->query($query);
?>
<body>
	<section class="content">
		<h1><center>User List</center></h1>
		<div class="warper container-fluid">
			<div class="col-md-12 col-sm-12">
				<?php 
						if($result->num_rows > 0)
						{
					?>
				<div class="panel panel-default">
					
					<table id="table" class="table table-borderless">
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Expiry Date</th>
						</tr>
						<?php 
							while($row = $result->fetch_assoc()){
								echo '<tr>
									<th>'.$row["fname"].' '.$row["lname"].'</th>
									<th>'.$row["email"].'</th>
									<th>'.$row["expiry"].'</th>
								</tr>';
							}
						?>
					</table>						
				</div>
				<?php }
							else {
								echo '<div class="alert alert-info">
									 No users found.
									</div>';
							}
						?>
			</div>		
		</div>
	</section>
</body>
</html>