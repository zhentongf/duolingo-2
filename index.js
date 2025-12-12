try {
	process.env.LESSONS = process.env.LESSONS ?? 1;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
		"user-agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	};

	function parseJwt(token) {
	  const base64Url = token.split('.')[1];
	  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	  const jsonPayload = decodeURIComponent(
	    atob(base64)
	      .split('')
	      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
	      .join('')
	  );
	  return JSON.parse(jsonPayload);
	}

	const { sub } = parseJwt(process.env.DUOLINGO_JWT);

	const { fromLanguage, learningLanguage } = await fetch(
		`https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage`,
		{
			headers,
		},
	).then((response) => response.json());

	let xp = 0;
	for (let i = 0; i < process.env.LESSONS; i++) {
		const session = await fetch(
			"https://www.duolingo.com/2017-06-30/sessions",
			{
				body: JSON.stringify({
					challengeTypes: [
						"assist",
						"characterIntro",
						"characterMatch",
						"characterPuzzle",
						"characterSelect",
						"characterTrace",
						"characterWrite",
						"completeReverseTranslation",
						"definition",
						"dialogue",
						"extendedMatch",
						"extendedListenMatch",
						"form",
						"freeResponse",
						"gapFill",
						"judge",
						"listen",
						"listenComplete",
						"listenMatch",
						"match",
						"name",
						"listenComprehension",
						"listenIsolation",
						"listenSpeak",
						"listenTap",
						"orderTapComplete",
						"partialListen",
						"partialReverseTranslate",
						"patternTapComplete",
						"radioBinary",
						"radioImageSelect",
						"radioListenMatch",
						"radioListenRecognize",
						"radioSelect",
						"readComprehension",
						"reverseAssist",
						"sameDifferent",
						"select",
						"selectPronunciation",
						"selectTranscription",
						"svgPuzzle",
						"syllableTap",
						"syllableListenTap",
						"speak",
						"tapCloze",
						"tapClozeTable",
						"tapComplete",
						"tapCompleteTable",
						"tapDescribe",
						"translate",
						"transliterate",
						"transliterationAssist",
						"typeCloze",
						"typeClozeTable",
						"typeComplete",
						"typeCompleteTable",
						"writeComprehension",
					],
					fromLanguage,
					isFinalLevel: false,
					isV2: true,
					juicy: true,
					learningLanguage,
					smartTipsVersion: 2,
					type: "GLOBAL_PRACTICE",
				}),
				headers,
				method: "POST",
			},
		).then((response) => response.json());

		const response = await fetch(
			`https://www.duolingo.com/2017-06-30/sessions/${session.id}`,
			{
				body: JSON.stringify({
					...session,
					heartsLeft: 0,
					startTime: (+new Date() - 60000) / 1000,
					enableBonusPoints: false,
					endTime: +new Date() / 1000,
					failed: false,
					maxInLessonStreak: 9,
					shouldLearnThings: true,
				}),
				headers,
				method: "PUT",
			},
		).then((response) => response.json());

		xp += response.xpGain;
	}

	console.log(`🎉 You won ${xp} XP`);
} catch (error) {
	console.log("❌ Something went wrong");
	if (error instanceof Error) {
		console.log(error.message);
	}
}
