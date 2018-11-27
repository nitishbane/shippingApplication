<?php 
	include('../dbconn.php');
	include('header.php');
	include('sidebar.php');
	$query = 'select * from offers';
	$result = $conn->query($query);
?>
<body>
	<section class="content">
		<h1><center>Offer List</center></h1>
		<div class="warper container-fluid">
			<div class="col-md-12 col-sm-12">
				<?php 
						if($result->num_rows > 0)
						{
					?>
				<div class="panel panel-default">
					
					<table id="table" class="table table-bordered">
						<thead>
							<tr>
								<th>No</th>
								<th>Image</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>	
						<?php 
							$i=1;
							while($row = $result->fetch_assoc()){
								echo '<tr>
									<td>'.$i.'</td>
									<td><img src="../'.$row["imgUrl"].'" withd="100" height="100"/></td>
									<td><a href="delete.php?type=offer&id='.$row["id"].'">Delete</a></td>
								</tr>';
								$i++;
							}
						?>
						</tbody>
					</table>						
				</div>
				<?php }
							else {
								echo '<div class="alert alert-info">
									 No offers found.
									</div>';
							}
						?>
			</div>		
		</div>
	</section>
</body>
</html>