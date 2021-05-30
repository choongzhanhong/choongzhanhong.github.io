//Script for Portfolio Page

let textarea = document.getElementById('textBox');
let button = document.getElementById('gpt2Button');

let texts = [
"Toxic. No one likes toxic people. Toxic people are the ones who never do anything bad. Toxic people are the ones who only take advantage of others. Toxic people are the ones who only care about themselves. Toxic people are the ones who only care about their own ego. Toxic people are the ones who only care about the person they love. Toxic people are the ones who only care about their own ego. Toxic people are the ones who only care about themselves.",
"Girlfriend and I have been together for 3 years. I’ve told my ex about how we’ve been in a relationship for about 2 years. I feel like this is the first time we have ever felt this way. I don’t know if I should tell her about how I feel. I am very afraid that this relationship will lead to something worse. She might feel like she has been treating me badly, treating me badly in the past, treating me badly in the future, treating me badly in the future. I’ve been feeling very guilty for feeling this way. I feel like I really have to do this to make her feel better, to make her feel like I’m the one who’s going to hurt her in the future. I really don’t want to hurt her. I don’t want to hurt myself.",
"I’m a senior at a local company. I’m a girl. I am also a guy. I don’t have much friends but I’m constantly reminded of them. I get reminded of how they feel like being abandoned by their own lives. They are always the ones who are always the first to feel loved. They would often argue with me about this or that issue. They would say that I should give them more space to think about this issue. I would often remind them that it is a good thing that they are being deprived of this space.",
"I have been talking to a guy for a month now. I am a guy, but I have a very cute girl that is more of a friend. She has a very strong personality and is very sweet. I have a crush on her. I told her that I was going to meet up with her sometime this year. I will be going out with her for a few days. She said that she will come back to me for a few days too. Recently, she told me that she is attached. I told her that I will try to convince her to join me. She told me that she will be fine if I just talk to her. She said that she is still in love with me. She said that she is not interested in me anymore. She told me that she is just waiting for me to give up on her. I am really happy for her. I have been trying to convince her that she is not interested in me anymore. She has been asking me to wait for her for a few days. She has been asking me to stay with her. I have tried to convince her but she is not happy.",
"I'm so tired of being a typical and sexist gamer. I'm so tired of being a nerd. I'm tired of the toxic masculinity I've been living with. I'm tired of the occasional trolling post. I'm tired of being a casual gamer. I'm tired of the random posts that are posted on reddit or redditgifts. I'm tired of being a personal attack on the other people who are gaming, and it really is really annoying. I'm tired of being a person who can't be bothered to keep up with the toxic masculinity that I've been living with."
]

button.count = 0;
button.addEventListener('click', function(){
	textarea.innerHTML = texts[button.count];
	button.count++;
	if (button.count%texts.length == 0) {
		button.count = 0;
	};
});