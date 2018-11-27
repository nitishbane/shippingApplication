<?php 
	include('header.php');
	include('sidebar.php');
	if(isset($_GET['status']))
	{
		$status = $_GET['status'];
		$msg = $_GET['msg'];
		if($status == 'success'){
			echo '<script>alert("Offer uploaded successfully")</script>';
		}else if($status == 'fail'){
			echo '<script>alert("Failed to upload offer "'.$msg.')</script>';
		}
	}
?>
<body>
<section class="content">
	<div class="warper container-fluid">
		<div class="col-md-12 col-sm-12">
			<div class="panel panel-default">
				<div class="panel-heading">Add Offer</div>
				<div class="panel-body">
					<form method="post" action="add.php" enctype = "multipart/form-data">
						<input type="hidden" name="type" value="offer"/>
						<div class="row">
							<div class="form-group col-md-6">
								<div class="custom-file">
								  <input type="file" class="custom-file-input" id="customFile" name="offer">
								  <label class="custom-file-label" for="customFile">Choose Offer file</label>
								</div>								
							</div>
						</div>	
						<br>
						<div class="row">
							<div class="form-group">	
								<input type="submit" name="submit" value="Upload" class="btn btn-primary" style="margin-left:30px">
							</div>
						</div>	
					</form>
				</div>
			</div>
		</div>
	</div>
</section>	