<?php
/**
* This script generats HTML for all categories that contain all the questions
* for that category.
*/

function status($message)
{
    echo $message, "\n";
    flush();
}

function getItemVal($element, $itemName)
{
    return $element->getElementsByTagName($itemName)->item(0)->nodeValue;
}

function md5num($target, $base)
{
    $md5 = md5($target);
    $ret = 0;

    for ($i = 0; $i < 32; $i++) {
        $ret = ($ret * 16 + hexdec($md5[$i])) % $base;
    }

    return $ret;
}

function generateGroupId($category, $i, $exGroupElement)
{
    return $category['id'] * 10000 + $i % 100 * 100 + md5num(getItemVal($exGroupElement, 'title'), 100);
}

// Create directiory in case it doesn't exist yet
// @mkdir('tests', 0755);

$categories = json_decode(file_get_contents('data/categories.json'), true);

// Generate index JSONP
$jsonp = 'callbackcategories(' . json_encode($categories) . ')';
file_put_contents('data/jsonp/categories.js', $jsonp);

// Loop through each category and create a standalone page for it
foreach ($categories as $category) {
    $catContent = file_get_contents("data/category/{$category['id']}.xml");
    $catDoc = DOMDocument::loadXML($catContent, LIBXML_COMPACT | LIBXML_NONET);
    $catXPath = new DOMXpath($catDoc);

    // Fetch all questions
    $questions = array();
    $qi = 0;
    foreach ($catXPath->query("/Page/exercises/Exercise") as $exElement) {
        $question = array(
            'id' => (int) getItemVal($exElement, 'id'),
            'question' => getItemVal($exElement, 'question'),
            'choices' => array(),
            'correct' => null,
            'assets' => array(),
        );

        $questions[$qi++] = $question;
    }

    // Fetch questions' answer choices
    foreach ($questions as $qid => $question) {
        $exContent = file_get_contents("data/exercise/{$question['id']}.xml");
        $exDoc = DOMDocument::loadXML($exContent, LIBXML_COMPACT | LIBXML_NONET);
        $exXPath = new DOMXpath($exDoc);

        foreach ($exXPath->query("/ExerciseDetails/choices/Choice/label") as $labelElement) {
            $questions[$qid]['choices'][] = $labelElement->nodeValue;
        }

        $questions[$qid]['correct'] = (int) $exXPath->query("/ExerciseDetails/correct")->item(0)->nodeValue;

        foreach ($exXPath->query("/ExerciseDetails/file/url") as $assetElement) {
            $questions[$qid]['assets'][] = basename($assetElement->nodeValue);
        }        
    }

    // Start output buffering
    ob_start();

    $exCount = 0;
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title><?php echo $category['title']; ?> &ndash; KRESZ teszt</title>
        <meta property="og:site_name" content="KRESZ teszt &ndash; <?php echo $category['title']; ?>" />
        <meta property="og:description" content="Böngészd a <?php echo $category['title']; ?> KRESZ teszt összes kérdését!" />
        <link rel="stylesheet" href="test.css" />
    </head>
    <body>
        <h1><?php echo $category['title']; ?></h1>

        <p><a href="../"><strong>&laquo; Vissza az interaktív KRESZ teszthez</strong></a></p>
        <ol id="index">
            <?php foreach ($catXPath->query("/Page/test/groups/ExerciseGroup") as $key => $exGroupElement): ?>
            <li>
                <a href="#group-<?php echo generateGroupId($category, $key, $exGroupElement); ?>"><?php echo getItemVal($exGroupElement, 'title'); ?></a>
                (<?php echo $exGroupElement->getElementsByTagName('exercises')->item(0)->getElementsByTagName('e')->length; ?> db.)
            </li>
            <?php endforeach; ?>
        </ol>

        <div id="groups">
            <?php foreach ($catXPath->query("/Page/test/groups/ExerciseGroup") as $key => $exGroupElement): ?>
            <div class="group" id="group-<?php echo generateGroupId($category, $key, $exGroupElement); ?>">
                <h2>
                    <?php echo getItemVal($exGroupElement, 'title') ?>
                    (<?php echo getItemVal($exGroupElement, 'count') ?> db., <?php echo getItemVal($exGroupElement, 'score') ?> pont)
                </h2>
                <div class="questions">
                    <?php foreach ($exGroupElement->getElementsByTagName('exercises')->item(0)->getElementsByTagName('e') as $exElement): ?>
                    <?php $question = $questions[(int) $exElement->nodeValue]; ?>
                    <div class="question" id="question-<?php echo $question['id'] ?>">
                        <?php $exCount++ ?>
                        <?php foreach ($question['assets'] as $filename): ?>
                            <div class="exercise-image">
                                <img src="../data/asset/<?php echo $filename; ?>" />
                            </div>
                        <?php endforeach; ?>
                        <!-- <h4><?php echo $exCount ?>. <?php echo $question['question'] ?></h4> -->
                        <dl>
                            <dt><?php echo $exCount; ?>. <?php echo $question['question']; ?> <a href="#question-<?php echo $question['id']; ?>"><small>#<?php echo $question['id']; ?></small></a></dt>
                            <?php foreach ($question['choices'] as $i => $choice): ?>
                                <dd class="<?php echo $i == $question['correct'] ? 'correct' : '' ?>"><?php echo $choice; ?></dd>
                            <?php endforeach; ?>
                        </dl>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <script src="http://kresz-tesztelo.rhcloud.com/offline-trackback.js?page=test&amp;category=<?php echo $category['id']; ?>" async="true" type="text/javascript"></script>
    </body>
</html>
<?php
    $html = ob_get_clean();
    file_put_contents('tests/' . $category['id'] . '.html', $html);

    status("Generated HTML page for category '{$category['title']}' ({$category['id']}).");

    $json = array(
        'id' => $category['id'],
        'title' => $catXPath->query("/Page/meta/label")->item(0)->nodeValue,
        'masteryPercent' => (int) $catXPath->query("/Page/test/masteryPercent")->item(0)->nodeValue,
        'exTimeLimit' => (int) $catXPath->query("/Page/test/exTimeLimit")->item(0)->nodeValue,
        'groups' => array(),
        'questions' => array(),
    );

    foreach ($questions as $question) {
        $json['questions'][$question['id']] = $question;
    }

    foreach ($catXPath->query("/Page/test/groups/ExerciseGroup") as $key => $exGroupElement) {
        $hash = md5(getItemVal($exGroupElement, 'title'));
        $group = array(
            'id' => generateGroupId($category, $key, $exGroupElement),
            'title' => getItemVal($exGroupElement, 'title'),
            'count' => (int) getItemVal($exGroupElement, 'count'),
            'score' => (int) getItemVal($exGroupElement, 'score'),
            'questions' => array(),
        );

        foreach ($exGroupElement->getElementsByTagName('exercises')->item(0)->getElementsByTagName('e') as $exElement) {
            $question = $questions[(int) $exElement->nodeValue];
            $group['questions'][] = $question['id'];
        }

        $json['groups'][] = $group;
    }

    $jsonp = 'callback' . $category['id'] . '(' . json_encode($json) . ')';
    file_put_contents('data/jsonp/' . $category['id'] . '.js', $jsonp);

    status("Generated JSONP for category '{$category['title']}' ({$category['id']}).");
}

// Generate index
ob_start();
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>KRESZ tesztek</title>
        <link rel="stylesheet" href="test.css" />
    </head>
    <body>
        <h1>KRESZ tesztek</h1>

        <p><a href="../"><strong>&laquo; Vissza a KRESZ teszthez</strong></a></p>
        <ul>
            <?php foreach ($categories as $category): ?>
            <li><a href="<?php echo $category['id']; ?>.html"><?php echo $category['title']; ?></a></li>
            <?php endforeach; ?>
        </ul>

        <script src="http://kresz-tesztelo.rhcloud.com/offline-trackback.js?page=test-index" async="true" type="text/javascript"></script>
    </body>
</html>
<?php
$html = ob_get_clean();
file_put_contents('tests/index.html', $html);
