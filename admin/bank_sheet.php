<?php
	include('../dbconn.php');
	include('header.php');
	include('sidebar.php');
	$query = 'select * from banksheet';
	$result = $conn->query($query);
	if(isset($_GET['status']))
	{
		$status = $_GET['status'];
		$msg = $_GET['msg'];
		if($status == 'success'){
			echo '<script>alert("Sheet Saved successfully")</script>';
		}else if($status == 'fail'){
			echo '<script>alert("Failed to save sheet. '.$msg.'")</script>';
		}
	}
?>
<body>
<section class="content">
	<div class="warper container-fluid">
		<div class="col-md-12 col-sm-12">
			<div class="panel panel-default">
				<div class="panel-heading">Add Bank TT Sheet</div>
				<div class="panel-body">
					<form method="post" action="add.php" enctype = "multipart/form-data" class="validator-form form-horizontal">
						<input type="hidden" name="type" value="bankttsheet"/>
						<div class="form-group">
							<label class="control-label col-md-2 col-sm-2 left">Bank Name</label>
							<div class="col-md-4 col-sm-4">
								<input type="text" name="bank_name" class="form-control"/>
							</div>							
						</div>
						<div class="form-group">
							<label class="control-label col-md-2 col-sm-2 left">Bank TT Sheet</label>
							<div class="custom-file" style="width:31%;margin-left:14px">
								<input type="file" class="custom-file-input" id="customFile" name="ttsheet">
								<label class="custom-file-label" for="customFile"></label>
							</div>								
						</div>
						<div class="row">
							<div class="form-group">	
								<input type="submit" name="submit" value="Save" class="btn btn-primary" style="margin-left:30px">
							</div>
						</div>
					</form>
				</div>
			</div>
			<div class="panel panel-default">
				<div class="panel-heading">List of Bank Sheet</div>
				<div class="panel-body">
					<table id="table" class="table table-borderless">
						<thead>
							<tr>
								<th>No</th>
								<th>Bank Name</th>
								<th>Sheet File</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
						<?php 
							$i = 1;
							while($row = $result->fetch_assoc()){
								$fileName = explode('/',$row["sheetPath"]);
								echo '<tr>
									<td>'.$i.'</td>
									<td>'.$row["bankName"].'</td>
									<td>'.end($fileName).'</td>
									<td><a href="delete.php?type=ttsheet&id='.$row["id"].'">Delete</a></td>
								</tr>';
							}
						?>
						</tbody>
					</table>
				</div>
			</div>	
		</div>
	</div>
</section>	