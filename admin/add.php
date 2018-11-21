<?php 
include('../dbconn.php');
echo $_SERVER['HTTP_REFERER'];
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
						$insertQuery = 'insert into offers(imgUrl) values("'.$target_file.'")';						
						if($conn->query($insertQuery)){	
							$errMsg = '';
							header('location:'.$_SERVER['HTTP_REFERER'].'?status='.$status.'&msg='.$errMsg);
						}else{
							$status = 'fail';
							header('location:'.$_SERVER['HTTP_REFERER'].'?status='.$status.'&msg='.$errMsg);
						}						
					}
					else{
						$status = 'fail';
						header('location:'.$_SERVER['HTTP_REFERER'].'?status='.$status.'&msg='.$errMsg);
					}
				}
			}	
			else{
				$status = 'fail';
				header('location:'.$_SERVER['HTTP_REFERER'].'?status='.$status.'&msg='.$errMsg);
			}			
		break;
	}
}
?>