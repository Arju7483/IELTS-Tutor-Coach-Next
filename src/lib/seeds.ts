/**
 * Seed data for IELTS Writing Task 2 questions, Speaking questions, and Vocabulary words.
 * Used by API routes on first request when collections are empty.
 */

export const writingTask2Seeds = [
  // Education
  { topic: "Education", prompt: "Some people believe that children should be taught how to manage money at school. Do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  { topic: "Education", prompt: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both views and give your opinion.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Education", prompt: "In some countries, secondary schools aim to provide a general education across a range of subjects. In others, children focus on a narrow range of subjects related to a particular career. Which do you think is the better approach and why?", difficulty: "Hard", taskType: "Opinion" },
  { topic: "Education", prompt: "Many schools now use technology such as computers and tablets in the classroom. What are the advantages and disadvantages of this trend?", difficulty: "Easy", taskType: "Two-part" },
  { topic: "Education", prompt: "Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages of this outweigh the disadvantages?", difficulty: "Medium", taskType: "Two-part" },
  // Technology
  { topic: "Technology", prompt: "Some people think that developments in technology have made our lives more complicated. To what extent do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  { topic: "Technology", prompt: "Many people use social media every day. What problems does this cause? What solutions can you suggest?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Technology", prompt: "Some people argue that robots will replace human workers in many industries within the next 30 years. What problems will this cause and how can society address them?", difficulty: "Hard", taskType: "Problem/Solution" },
  { topic: "Technology", prompt: "Some people say that the internet has made it easier for people to access information, while others argue it has created too much misinformation. Discuss both views and give your opinion.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Technology", prompt: "Nowadays, many people use personal devices to access the internet rather than shared computers. Do the advantages of this outweigh the disadvantages?", difficulty: "Easy", taskType: "Two-part" },
  // Environment
  { topic: "Environment", prompt: "Climate change is a serious global problem. Some people believe that individuals can do nothing about it. To what extent do you agree or disagree?", difficulty: "Medium", taskType: "Opinion" },
  { topic: "Environment", prompt: "Some people think that instead of preventing climate change, we need to find a way to live with it. Discuss both views and give your own opinion.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Environment", prompt: "Many governments have introduced measures to reduce air pollution, yet the problem persists in many cities. What are the causes and what further steps could be taken?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Environment", prompt: "Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both views and give your opinion.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Environment", prompt: "Environmental problems are too big for individual countries or people to address. We need international cooperation to solve these issues. To what extent do you agree or disagree?", difficulty: "Medium", taskType: "Opinion" },
  // Society & Culture
  { topic: "Society", prompt: "In many countries, the gap between the rich and the poor is widening. What problems does this cause and what measures can be taken to address it?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Society", prompt: "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  { topic: "Culture", prompt: "Many traditional customs and values are being lost as a result of globalisation. What are the causes and what can be done about this?", difficulty: "Hard", taskType: "Problem/Solution" },
  { topic: "Society", prompt: "Crime is a growing problem in many cities. What are the main causes of crime and what are the best ways to prevent it?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Culture", prompt: "International tourism has both advantages and disadvantages. Discuss both sides and give your opinion.", difficulty: "Easy", taskType: "Discussion" },
  // Health
  { topic: "Health", prompt: "Some people say that the best way to improve public health is by increasing the number of sports facilities. Others disagree and say that other measures are needed. Discuss both views and give your opinion.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Health", prompt: "Obesity among children is rising in many countries. What are the causes and effects of this problem?", difficulty: "Easy", taskType: "Problem/Solution" },
  { topic: "Health", prompt: "In some countries, healthcare is a luxury that only wealthy people can afford. What problems does this cause and what solutions can you suggest?", difficulty: "Hard", taskType: "Problem/Solution" },
  { topic: "Health", prompt: "Some people believe that it is the responsibility of individuals to maintain a healthy lifestyle. Others think that governments should ensure citizens' health. Discuss both views.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Health", prompt: "Mental health is just as important as physical health, yet it receives less attention. Do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  // Work & Economy
  { topic: "Work", prompt: "Some people prefer to work for a large company. Others prefer to work for a small company. Discuss both views and give your opinion.", difficulty: "Easy", taskType: "Discussion" },
  { topic: "Economy", prompt: "Some believe that economic development is the key to reducing poverty. Others think that other factors are more important. Discuss both views.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Work", prompt: "Many people are choosing to work from home rather than in offices. What are the advantages and disadvantages of working from home?", difficulty: "Easy", taskType: "Two-part" },
  { topic: "Work", prompt: "The retirement age in many countries is being raised. What are the advantages and disadvantages of this trend?", difficulty: "Medium", taskType: "Two-part" },
  { topic: "Economy", prompt: "Some people think that all workers should receive the same salary. To what extent do you agree or disagree?", difficulty: "Medium", taskType: "Opinion" },
  // Government & Policy
  { topic: "Government", prompt: "Some people think that the government should spend money on building railways for fast trains between cities. Others believe the money should be spent on improving existing public transport. Discuss both views.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Government", prompt: "Many governments spend a large amount of money on defence. Some people believe this money should be spent on more useful things. To what extent do you agree or disagree?", difficulty: "Hard", taskType: "Opinion" },
  { topic: "Government", prompt: "Some countries have introduced laws to limit the amount of sugar in food and drinks. Do you think this is a positive or negative development?", difficulty: "Easy", taskType: "Opinion" },
  // Media & Communication
  { topic: "Media", prompt: "News media today often prioritises speed over accuracy. What problems does this create and how can they be solved?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Media", prompt: "Some people believe that social media platforms should be regulated by the government. Others believe that they should be self-regulating. Discuss both sides.", difficulty: "Hard", taskType: "Discussion" },
  // Urbanisation & Transport
  { topic: "Urbanisation", prompt: "Many major cities are facing a growing population problem. What problems does overpopulation in cities cause and how should governments deal with it?", difficulty: "Medium", taskType: "Problem/Solution" },
  { topic: "Transport", prompt: "Some people believe that the best way to reduce traffic congestion is to increase the price of petrol. To what extent do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  // Science
  { topic: "Science", prompt: "Some people think that space exploration is a waste of money and resources. Others think it is essential for the future of humanity. Discuss both views and give your opinion.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Science", prompt: "Scientific research should be carried out and controlled by the government rather than private companies. To what extent do you agree or disagree?", difficulty: "Medium", taskType: "Opinion" },
  // Arts & Leisure
  { topic: "Arts", prompt: "Some people think that governments should spend money on art and culture, while others believe that more important issues should be funded. Discuss both views.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Arts", prompt: "Art and music are considered as important subjects in education. However, some schools have started removing these from the curriculum. Do you think this is a positive or negative development?", difficulty: "Easy", taskType: "Opinion" },
  // Food & Agriculture
  { topic: "Food", prompt: "Genetically modified food is becoming more common. What are the advantages and disadvantages of GM food?", difficulty: "Medium", taskType: "Two-part" },
  { topic: "Food", prompt: "An increasing number of people are choosing to become vegetarian. What are the reasons for this and is it a positive trend?", difficulty: "Easy", taskType: "Two-part" },
  // Family & Children
  { topic: "Family", prompt: "In many countries, both parents work and therefore children are looked after by grandparents or other family members. Do the advantages of this outweigh the disadvantages?", difficulty: "Medium", taskType: "Two-part" },
  { topic: "Family", prompt: "Some people think that parents should teach their children how to be good members of society. Others think school is the best place for this. Discuss both views and give your opinion.", difficulty: "Easy", taskType: "Discussion" },
  // Law & Justice
  { topic: "Law", prompt: "Some people think that strict punishments for driving offences are the key to reducing traffic accidents. Others think there are better ways to improve road safety. Discuss both views.", difficulty: "Medium", taskType: "Discussion" },
  { topic: "Law", prompt: "Should prisoners be given the opportunity to receive an education while serving their sentence? To what extent do you agree or disagree?", difficulty: "Hard", taskType: "Opinion" },
  // Language
  { topic: "Language", prompt: "Some people think that one language should be used as the international language globally. Others believe that this would lead to the loss of cultural identity. Discuss both views.", difficulty: "Hard", taskType: "Discussion" },
  { topic: "Language", prompt: "Learning a new language at an early age is beneficial for children. Do you agree or disagree?", difficulty: "Easy", taskType: "Opinion" },
  // Sport & Lifestyle
  { topic: "Sport", prompt: "Professional athletes are often paid much more than people in other important professions. Do you think this is justified or unjustified?", difficulty: "Medium", taskType: "Opinion" },
];

export const speakingSeeds = [
  // Part 1 — Easy personal questions
  { topic: "Hobby", prompt: "Do you have any hobbies? What are they? Why do you enjoy them?", part: "Part 1", difficulty: "Easy" },
  { topic: "Hometown", prompt: "Where is your hometown? Do you like living there? Why or why not?", part: "Part 1", difficulty: "Easy" },
  { topic: "Work & Study", prompt: "Do you work or study? What do you like most about your work or studies?", part: "Part 1", difficulty: "Easy" },
  { topic: "Music", prompt: "What kind of music do you like to listen to? When do you usually listen to music?", part: "Part 1", difficulty: "Easy" },
  { topic: "Reading", prompt: "Do you enjoy reading books? What was the last book you read?", part: "Part 1", difficulty: "Easy" },
  { topic: "Weather", prompt: "What is your favorite type of weather? Does the weather affect your mood?", part: "Part 1", difficulty: "Easy" },
  { topic: "Food", prompt: "What is your favorite meal of the day? Do you prefer eating at home or at restaurants?", part: "Part 1", difficulty: "Easy" },
  { topic: "Sports", prompt: "Do you play any sports or exercise regularly? Why is it important for people to stay active?", part: "Part 1", difficulty: "Easy" },
  { topic: "Friends", prompt: "How often do you hang out with your friends? What do you usually do together?", part: "Part 1", difficulty: "Easy" },
  { topic: "Technology", prompt: "How often do you use a computer or smartphone? What do you use them for?", part: "Part 1", difficulty: "Easy" },
  { topic: "Shopping", prompt: "Do you prefer shopping online or in stores? Why?", part: "Part 1", difficulty: "Easy" },
  { topic: "Daily Routine", prompt: "What does your typical day look like? Do you like routines or surprises?", part: "Part 1", difficulty: "Easy" },
  { topic: "Movies", prompt: "What types of movies do you enjoy watching? How often do you go to the cinema?", part: "Part 1", difficulty: "Easy" },
  { topic: "Neighbours", prompt: "Do you know your neighbours well? What makes a good neighbour?", part: "Part 1", difficulty: "Easy" },
  { topic: "Holidays", prompt: "What is your favourite holiday? How do people usually celebrate it in your country?", part: "Part 1", difficulty: "Easy" },

  // Part 2 — Cue card (medium)
  { topic: "Travel", prompt: "Describe a place you visited that had a significant impact on you. You should say: where it was, why you went there, what you did there, and explain why it was so memorable.", part: "Part 2", difficulty: "Medium" },
  { topic: "Teacher", prompt: "Describe your favourite teacher from school. You should say: who they were, what subject they taught, what they were like, and explain why you liked them so much.", part: "Part 2", difficulty: "Medium" },
  { topic: "Book", prompt: "Describe a book you read recently that you found interesting. You should say: what the book was, what it was about, why you decided to read it, and explain why you liked it.", part: "Part 2", difficulty: "Medium" },
  { topic: "Journey", prompt: "Describe a long journey you went on that you enjoyed. You should say: where you went, how you travelled, who you went with, and explain why you enjoyed the journey.", part: "Part 2", difficulty: "Medium" },
  { topic: "Decision", prompt: "Describe an important decision you made in your life. You should say: what the decision was, when you made it, how you felt about it, and explain why it was so important.", part: "Part 2", difficulty: "Medium" },
  { topic: "Event", prompt: "Describe an important family event you attended recently. You should say: what the event was, who was there, what happened, and explain how you felt about it.", part: "Part 2", difficulty: "Medium" },
  { topic: "Gift", prompt: "Describe a special gift you received from someone. You should say: what it was, who gave it to you, why they gave it to you, and explain why it was special to you.", part: "Part 2", difficulty: "Medium" },
  { topic: "City", prompt: "Describe a city you would like to visit in the future. You should say: where it is, how you know about it, what you would do there, and explain why you want to visit it.", part: "Part 2", difficulty: "Medium" },
  { topic: "Photograph", prompt: "Describe a photograph you took that you are proud of. You should say: when you took it, where you took it, what is in the photograph, and explain why you are proud of it.", part: "Part 2", difficulty: "Medium" },
  { topic: "Skill", prompt: "Describe a useful skill you learned recently. You should say: what the skill is, how you learned it, who helped you learn it, and explain why it is useful.", part: "Part 2", difficulty: "Medium" },
  { topic: "Childhood Memory", prompt: "Describe a happy memory from your childhood. You should say: when and where it happened, who you were with, what happened, and explain why you remember it so well.", part: "Part 2", difficulty: "Medium" },
  { topic: "Achievement", prompt: "Describe something you achieved that you were proud of. You should say: what you achieved, when this happened, how hard it was, and explain why you were proud.", part: "Part 2", difficulty: "Medium" },
  { topic: "Person", prompt: "Describe a person who has had a great influence on your life. You should say: who they are, how you know them, what they have done, and explain why they influenced you.", part: "Part 2", difficulty: "Medium" },
  { topic: "Movie", prompt: "Describe a movie you watched that left a strong impression on you. You should say: what the movie was, what it was about, when you watched it, and explain why it impressed you.", part: "Part 2", difficulty: "Medium" },
  { topic: "Technology", prompt: "Describe a piece of technology you find very useful. You should say: what it is, when you started using it, how often you use it, and explain why it is useful.", part: "Part 2", difficulty: "Medium" },

  // Part 3 — Abstract discussion (hard)
  { topic: "Technology", prompt: "How has the internet changed the way we communicate with each other?", part: "Part 3", difficulty: "Hard" },
  { topic: "Environment", prompt: "What are the most serious environmental problems in your country today?", part: "Part 3", difficulty: "Hard" },
  { topic: "Tourism", prompt: "What are the advantages and disadvantages of international tourism for local communities?", part: "Part 3", difficulty: "Hard" },
  { topic: "Education", prompt: "Should university education be free for all students? Why or why not?", part: "Part 3", difficulty: "Hard" },
  { topic: "Economy", prompt: "How does globalisation affect local cultures and traditional businesses?", part: "Part 3", difficulty: "Hard" },
  { topic: "AI", prompt: "What are the potential risks and benefits of artificial intelligence replacing human jobs?", part: "Part 3", difficulty: "Hard" },
  { topic: "Health", prompt: "Who should be responsible for promoting healthy lifestyles: individuals or the government?", part: "Part 3", difficulty: "Hard" },
  { topic: "Culture", prompt: "Why is it important for governments to fund public museums and art galleries?", part: "Part 3", difficulty: "Hard" },
  { topic: "Media", prompt: "How has the rise of social media and online news altered public trust in traditional journalism?", part: "Part 3", difficulty: "Hard" },
  { topic: "Urbanisation", prompt: "What are the primary causes of urban overcrowding, and what solutions can city planners implement?", part: "Part 3", difficulty: "Hard" },
  { topic: "Crime", prompt: "Is prison the most effective way to deal with criminals, or are there better alternatives?", part: "Part 3", difficulty: "Hard" },
  { topic: "Family", prompt: "How has the role of grandparents in family life changed in recent years?", part: "Part 3", difficulty: "Hard" },
  { topic: "Work", prompt: "What impact does remote working have on employee productivity and company culture?", part: "Part 3", difficulty: "Hard" },
  { topic: "Science", prompt: "Should governments increase spending on space exploration or focus on problems on Earth?",  part: "Part 3", difficulty: "Hard" },
  { topic: "Language", prompt: "Is it necessary for everyone to learn English, or should other languages receive more attention?", part: "Part 3", difficulty: "Hard" },
];

export const vocabSeeds = [
  // Band 7 words
  { word: "facilitate", phonetic: "/fəˈsɪlɪteɪt/", partOfSpeech: "verb", definition: "To make an action or process easier or more likely.", example: "The new software facilitates communication between team members.", synonyms: ["enable", "assist", "expedite"], difficulty: "band7" },
  { word: "subsequently", phonetic: "/ˈsʌbsɪkwəntli/", partOfSpeech: "adverb", definition: "After a particular thing has happened; afterwards.", example: "The company expanded rapidly and subsequently became the market leader.", synonyms: ["afterwards", "later", "thereafter"], difficulty: "band7" },
  { word: "predominant", phonetic: "/prɪˈdɒmɪnənt/", partOfSpeech: "adjective", definition: "Present as the strongest or main element.", example: "English is the predominant language used in international business.", synonyms: ["main", "chief", "primary"], difficulty: "band7" },
  { word: "undermine", phonetic: "/ˌʌndəˈmaɪn/", partOfSpeech: "verb", definition: "To damage or weaken, especially gradually.", example: "Constant criticism can undermine a child's self-confidence.", synonyms: ["weaken", "erode", "sabotage"], difficulty: "band7" },
  { word: "inevitable", phonetic: "/ɪnˈevɪtəbl/", partOfSpeech: "adjective", definition: "Certain to happen; unavoidable.", example: "With rising demand and limited supply, a price increase is inevitable.", synonyms: ["unavoidable", "inescapable", "certain"], difficulty: "band7" },
  { word: "elaborate", phonetic: "/ɪˈlæbərət/", partOfSpeech: "verb", definition: "To develop or present a theory, policy, or system in further detail.", example: "Could you elaborate on why you believe renewable energy is the best solution?", synonyms: ["expand", "detail", "develop"], difficulty: "band7" },
  { word: "controversy", phonetic: "/ˈkɒntrəvɜːsi/", partOfSpeech: "noun", definition: "Prolonged public disagreement or heated discussion.", example: "The new immigration policy has sparked considerable controversy.", synonyms: ["debate", "dispute", "contention"], difficulty: "band7" },
  { word: "sustainable", phonetic: "/səˈsteɪnəbl/", partOfSpeech: "adjective", definition: "Able to be maintained at a certain rate or level.", example: "The government aims to promote sustainable development across all sectors.", synonyms: ["viable", "enduring", "renewable"], difficulty: "band7" },
  { word: "competent", phonetic: "/ˈkɒmpɪtənt/", partOfSpeech: "adjective", definition: "Having the necessary ability, knowledge, or skill to do something successfully.", example: "Employers seek competent individuals who can adapt to changing work environments.", synonyms: ["capable", "proficient", "skilled"], difficulty: "band7" },
  { word: "implement", phonetic: "/ˈɪmplɪment/", partOfSpeech: "verb", definition: "To put a decision, plan, or agreement into effect.", example: "The school plans to implement a new anti-bullying policy next term.", synonyms: ["execute", "apply", "enforce"], difficulty: "band7" },
  // Band 8 words
  { word: "exacerbate", phonetic: "/ɪɡˈzæsəbeɪt/", partOfSpeech: "verb", definition: "To make a problem, bad situation, or negative feeling worse.", example: "The lack of affordable housing has exacerbated homelessness in urban areas.", synonyms: ["worsen", "aggravate", "intensify"], difficulty: "band8" },
  { word: "proliferation", phonetic: "/prəˌlɪfəˈreɪʃn/", partOfSpeech: "noun", definition: "Rapid increase in the number or amount of something.", example: "The proliferation of fake news on social media is a growing concern.", synonyms: ["expansion", "spread", "multiplication"], difficulty: "band8" },
  { word: "pragmatic", phonetic: "/præɡˈmætɪk/", partOfSpeech: "adjective", definition: "Dealing with things sensibly and realistically in a way based on practical considerations.", example: "A pragmatic approach to environmental policy involves balancing economic growth with conservation.", synonyms: ["practical", "realistic", "sensible"], difficulty: "band8" },
  { word: "detrimental", phonetic: "/ˌdetrɪˈmentl/", partOfSpeech: "adjective", definition: "Tending to cause harm.", example: "Excessive screen time can have a detrimental effect on children's social skills.", synonyms: ["harmful", "damaging", "injurious"], difficulty: "band8" },
  { word: "paradigm", phonetic: "/ˈpærədaɪm/", partOfSpeech: "noun", definition: "A typical example or pattern of something; a model or framework.", example: "The shift towards remote work represents a paradigm change in employment.", synonyms: ["model", "framework", "archetype"], difficulty: "band8" },
  { word: "unprecedented", phonetic: "/ʌnˈpresɪdentɪd/", partOfSpeech: "adjective", definition: "Never done or known before.", example: "The pandemic caused an unprecedented disruption to the global economy.", synonyms: ["unparalleled", "unmatched", "exceptional"], difficulty: "band8" },
  { word: "tangible", phonetic: "/ˈtændʒɪbl/", partOfSpeech: "adjective", definition: "Clear and definite; real; perceptible by touch.", example: "The investment in public transport has led to tangible improvements in air quality.", synonyms: ["concrete", "palpable", "measurable"], difficulty: "band8" },
  { word: "corroborate", phonetic: "/kəˈrɒbəreɪt/", partOfSpeech: "verb", definition: "To confirm or give support to a statement or theory.", example: "Recent studies corroborate the link between exercise and mental well-being.", synonyms: ["confirm", "verify", "substantiate"], difficulty: "band8" },
  { word: "juxtapose", phonetic: "/ˌdʒʌkstəˈpəʊz/", partOfSpeech: "verb", definition: "To place close together or side by side for comparison or contrast.", example: "The essay juxtaposes the benefits of urban living with the advantages of rural communities.", synonyms: ["compare", "contrast", "place side by side"], difficulty: "band8" },
  { word: "mitigate", phonetic: "/ˈmɪtɪɡeɪt/", partOfSpeech: "verb", definition: "To make something less severe, serious, or painful.", example: "Governments must implement carbon taxes to mitigate the effects of global warming.", synonyms: ["alleviate", "reduce", "diminish"], difficulty: "band8" },
  { word: "advocate", phonetic: "/ˈædvəkeɪt/", partOfSpeech: "verb", definition: "To publicly recommend or support.", example: "Many health experts advocate a balanced diet as a means of preventing chronic diseases.", synonyms: ["support", "champion", "endorse"], difficulty: "band8" },
  { word: "inherent", phonetic: "/ɪnˈhɪərənt/", partOfSpeech: "adjective", definition: "Existing in something as a permanent, essential, or characteristic attribute.", example: "There is an inherent risk in any investment that promises very high returns.", synonyms: ["intrinsic", "innate", "built-in"], difficulty: "band8" },
  { word: "disparity", phonetic: "/dɪˈspærəti/", partOfSpeech: "noun", definition: "A great difference.", example: "The income disparity between the richest and poorest citizens continues to grow.", synonyms: ["inequality", "gap", "imbalance"], difficulty: "band8" },
  { word: "scrutiny", phonetic: "/ˈskruːtɪni/", partOfSpeech: "noun", definition: "Critical observation or examination.", example: "The government's handling of the crisis has come under intense scrutiny.", synonyms: ["examination", "inspection", "analysis"], difficulty: "band8" },
  { word: "resilient", phonetic: "/rɪˈzɪliənt/", partOfSpeech: "adjective", definition: "Able to withstand or recover quickly from difficult conditions.", example: "A resilient economy can quickly adapt to unexpected disruptions.", synonyms: ["adaptable", "robust", "tough"], difficulty: "band8" },
  // Band 9 words
  { word: "ubiquitous", phonetic: "/juːˈbɪkwɪtəs/", partOfSpeech: "adjective", definition: "Present, appearing, or found everywhere.", example: "Smartphones have become ubiquitous in modern society, fundamentally altering how people interact.", synonyms: ["omnipresent", "pervasive", "universal"], difficulty: "band9" },
  { word: "ephemeral", phonetic: "/ɪˈfemərəl/", partOfSpeech: "adjective", definition: "Lasting for a very short time.", example: "The ephemeral nature of social media trends makes it difficult for advertisers to maintain a consistent strategy.", synonyms: ["transient", "fleeting", "short-lived"], difficulty: "band9" },
  { word: "recalcitrant", phonetic: "/rɪˈkælsɪtrənt/", partOfSpeech: "adjective", definition: "Having an obstinately uncooperative attitude towards authority or discipline.", example: "The recalcitrant attitude of certain nations towards climate agreements undermines global efforts.", synonyms: ["uncooperative", "defiant", "intractable"], difficulty: "band9" },
  { word: "promulgate", phonetic: "/ˈprɒmlɡeɪt/", partOfSpeech: "verb", definition: "To promote or make widely known (an idea or cause); to put a law into effect by official proclamation.", example: "The government promulgated new regulations to curb carbon emissions.", synonyms: ["proclaim", "announce", "disseminate"], difficulty: "band9" },
  { word: "sycophantic", phonetic: "/ˌsɪkəˈfæntɪk/", partOfSpeech: "adjective", definition: "Behaving or done in an obsequiously complimentary way to gain advantage.", example: "The sycophantic media coverage of the politician failed to hold power accountable.", synonyms: ["obsequious", "servile", "fawning"], difficulty: "band9" },
  { word: "perfunctory", phonetic: "/pəˈfʌŋktəri/", partOfSpeech: "adjective", definition: "Carried out with a minimum of effort or reflection.", example: "The safety inspection was perfunctory at best, failing to identify critical structural issues.", synonyms: ["cursory", "superficial", "mechanical"], difficulty: "band9" },
  { word: "anachronistic", phonetic: "/əˌnækrəˈnɪstɪk/", partOfSpeech: "adjective", definition: "Belonging to a period other than that being portrayed; out of date.", example: "Some argue that traditional classroom lectures are anachronistic in the age of digital learning.", synonyms: ["outdated", "antiquated", "obsolete"], difficulty: "band9" },
  { word: "equivocal", phonetic: "/ɪˈkwɪvəkl/", partOfSpeech: "adjective", definition: "Open to more than one interpretation; ambiguous.", example: "The minister gave an equivocal response when asked about the future of the programme.", synonyms: ["ambiguous", "vague", "indeterminate"], difficulty: "band9" },
  { word: "deleterious", phonetic: "/ˌdelɪˈtɪəriəs/", partOfSpeech: "adjective", definition: "Causing harm or damage.", example: "The deleterious effects of air pollution on cardiovascular health are well documented.", synonyms: ["harmful", "noxious", "injurious"], difficulty: "band9" },
  { word: "concomitant", phonetic: "/kənˈkɒmɪtənt/", partOfSpeech: "adjective", definition: "Naturally accompanying or associated.", example: "Economic growth and its concomitant environmental degradation present a complex policy dilemma.", synonyms: ["accompanying", "associated", "attendant"], difficulty: "band9" },
];
