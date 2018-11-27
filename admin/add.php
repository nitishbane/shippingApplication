<?php 
include('../dbconn.php');
$referer = $_SERVER['HTTP_REFERER'];
$base_url = explode('?', $referer);
$redirectUrl = $base_url[0];
if(isset($_POST))
{
	$type = $_POST['type'];
	switch($type){
		case 'offer':
			$errMsg = 'Something went wrong';
			if(isset($_FILES['offer']))
			{
				$target_dir = "../uploads/offers/";
				$target_file = $target_dir . basename($_FILES["offer"]["name"]);
				$dbUrl = "uploads/offers/" .  basename($_FILES["offer"]["name"]);
				$uploadOk = 1;
				
				$status = 'success';
				$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
				if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
					$uploadOk = 0;	
					$errMsg = 'Only images are allowed to be uploaded';
					$status = 'fail';
				}
				if($uploadOk != 0){
					if(move_uploaded_file($_FILES["offer"]["tmp_name"], $target_file)){
						$insertQuery = 'insert into offers(imgUrl) values("'.$dbUrl.'")';						
						if($conn->query($insertQuery)){	
							$errMsg = '';
							header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
						}else{
							$status = 'fail';
							header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
						}						
					}
					else{
						$status = 'fail';
						header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
					}
				}
			}	
			else{
				$status = 'fail';
				header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
			}			
		break;
		case 'bankttsheet':
			if($_FILES["ttsheet"]["tmp_name"] != '' && $_POST['bank_name'] != ''){
				
				$target_dir = "../uploads/ttsheet/";
				$target_file = $target_dir . basename($_FILES["ttsheet"]["name"]);
				$dbUrl = "uploads/ttsheet/" .  basename($_FILES["ttsheet"]["name"]);
				$bankName = $_POST['bank_name'];
				$uploadOk = 1;
				
				$status = 'success';
				if(move_uploaded_file($_FILES["ttsheet"]["tmp_name"], $target_file)){
					$insertQuery = 'insert into banksheet(bankName,sheetPath) values("'.$bankName.'","'.$dbUrl.'")';
					if($conn->query($insertQuery)){	
						$errMsg = '';
						header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
					}else{
						$status = 'fail';
						header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
					}					
				}
			}else{				
				$status = 'fail';
				$errMsg = 'Filed to save data.Please check all fields';
				header('location:'.$redirectUrl.'?status='.$status.'&msg='.$errMsg);
			} 
		break;
	}
}
?>