<?php



if( isset( $_POST['stuff'] ) ){
	echo urldecode( str_replace( '\\' , '' , $_POST['stuff'] ) );
	return;
}

if( isset( $_GET['stuff'] ) ){
	echo urldecode( str_replace( '\\' , '' , $_GET['stuff'] ) );
	return;
}



?>
