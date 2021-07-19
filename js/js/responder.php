

<?php
	ini_set('max_execution_time', 86400);
	ignore_user_abort(true);



	//Get action
	$fileName = "nick.txt";
	$milliSecondEndTime = empty($_POST['endTime']) ? '' : $_POST['endTime'];
	$endTime =round($milliSecondEndTime/1000);

		$currentTime = time();

		$timeLeft = $endTime - $currentTime;

	sleep($timeLeft);
	$myfile = fopen($fileName, "w") or die("Unable to open file!");
fwrite($myfile, $endTime . "\n");
fwrite($myfile, $currentTime . "\n");
fclose($myfile);
	exit();
	// Get filename

	// sleep(10);
	// $fileName = empty($_POST['fileName']) ? '' : $_POST['fileName'];
	//
	// // Get action
	// $endTime = empty($_POST['endTime']) ? '' : $_POST['endTime'];
	//
	// // Get action
	// $gameID = empty($_POST['gameID']) ? '' : $_POST['gameID'];
	//
	// $myfile = fopen($fileName, "w") or die("Unable to open file!");
	//
	// fwrite($myfile, $endTime . "\n");
	// fwrite($myfile, $gameID . "\n");
	// fclose($myfile);


?>
