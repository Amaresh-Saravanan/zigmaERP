<?php
include_once '../src/autoloader.php';

try {
	$SecureUPloadConfig = new Alirdn\SecureUPload\Config\SecureUPloadConfig;
	$SecureUPloadConfig->set( 'upload_folder', dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR );
	$SecureUPload = new Alirdn\SecureUPload\SecureUPload( $SecureUPloadConfig );
} catch ( Alirdn\SecureUPload\Exceptions\UploadFolderException $exception ) {
	echo "Exception: " . $exception->getMessage() . ' Code: ' . $exception->getCode() . ' Note: For more information check php error_log.';
	die();
}

$Upload = $SecureUPload->uploadFile( 'test_file' );

$get_Upload = $SecureUPload->getUpload( $Upload->id );

?>

<img src="<?php echo $get_Upload->path; ?>" alt="">
<div style="float: left; width: 50%; font-family: monospace;">
	== SecureUPload Config ==
	<?php  ?>
	== FILES ==
	<pre><?php  ?></pre>
</div>
<div style="float: left; width: 50%; font-family: monospace;">
	<form method="post" enctype="multipart/form-data">
		<input type="file" name="test_file"/>
		<input type="submit" value="Upload"/>
	</form>
	== Upload ==
	<pre><?php  ?></pre>
</div>