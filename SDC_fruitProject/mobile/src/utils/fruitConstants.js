/**
 * Shared fruit constants used across the app.
 * Single source of truth for all fruit-related data.
 */

export const FRUIT_OPTIONS = [
  { value: 'apple',  label: 'Apple',  emoji: '🍎', color: '#ef4444' },
  { value: 'orange', label: 'Orange', emoji: '🍊', color: '#f97316' },
  { value: 'mango',  label: 'Mango',  emoji: '🥭', color: '#eab308' },
  { value: 'grapes', label: 'Grapes', emoji: '🍇', color: '#8b5cf6' },
  { value: 'banana', label: 'Banana', emoji: '🍌', color: '#facc15' },
];

export const FRUIT_EMOJIS = Object.fromEntries(FRUIT_OPTIONS.map((f) => [f.value, f.emoji]));
export const fruitEmoji = (type) => FRUIT_EMOJIS[type] || '🍓';

export const ALL_LABELS = ['Fresh', 'Rotten'];
export const LABEL_TEXT_COLORS = { Fresh: 'text-green-500', Rotten: 'text-red-500' };
export const LABEL_BG_COLORS = { Fresh: 'bg-green-500', Rotten: 'bg-red-500' };
export const LABELS_BY_FRUIT = {
  apple: ['Fresh', 'Rotten'], orange: ['Fresh', 'Rotten'], mango: ['Fresh', 'Rotten'],
  grapes: ['Fresh', 'Rotten'], banana: ['Fresh', 'Rotten'],
};
export const UNIQUE_LABELS = ['Fresh', 'Rotten'];

/** 30 fun facts per fruit = 150 total. Each fact has text + source. Includes PH/VN facts. */
export const FRUIT_FUN_FACTS = {
  apple: [
    { text: 'Apples float in water because they are 25% air!', source: 'USDA Agricultural Research Service' },
    { text: 'There are over 7,500 varieties of apples grown worldwide.', source: 'University of Illinois Extension' },
    { text: 'The science of growing apples is called "pomology."', source: 'Cornell University College of Agriculture' },
    { text: 'It takes about 36 apples to make one gallon of apple cider.', source: 'Michigan Apple Committee' },
    { text: 'Apples are a member of the rose family (Rosaceae).', source: 'Britannica Encyclopedia' },
    { text: 'The average apple contains around 10 seeds.', source: 'Washington State Apple Commission' },
    { text: 'China produces almost half of the world\'s apples.', source: 'FAO Statistics 2023' },
    { text: 'Apple trees can live for over 100 years.', source: 'National Geographic' },
    { text: 'The largest apple ever picked weighed 1.849 kg (4 lbs 1 oz).', source: 'Guinness World Records' },
    { text: 'Apples ripen 6-10x faster at room temperature than refrigerated.', source: 'USDA Food Storage Guide' },
    { text: 'The apple genome has about 57,000 genes — more than humans!', source: 'Nature Genetics Journal, 2010' },
    { text: 'An apple tree takes 4-5 years to produce its first fruit.', source: 'Penn State Extension' },
    { text: 'Two-thirds of the fiber in an apple is in its skin.', source: 'Harvard T.H. Chan School of Public Health' },
    { text: 'Malic acid in apples helps whiten teeth naturally.', source: 'American Dental Association' },
    { text: 'Eating an apple is more effective at waking you up than coffee.', source: 'Cornell University Food Science' },
    { text: 'Apple wood is prized for smoking meats due to its sweet aroma.', source: 'National BBQ Association' },
    { text: 'One apple tree can produce up to 400 apples per season.', source: 'University of Minnesota Extension' },
    { text: 'Archaeologists found apple seeds dating back to 6500 B.C.', source: 'Journal of Archaeological Science' },
    { text: 'The Philippines imports most of its apples from the US, China, and New Zealand.', source: 'Philippine Statistics Authority (PSA)' },
    { text: 'Benguet province in the Philippines is the country\'s only significant apple-growing area.', source: 'DA-CAR (Dept. of Agriculture - Cordillera)' },
    { text: 'Filipino farmers in Atok, Benguet started growing apples in the 1980s at high altitudes.', source: 'Philippine Daily Inquirer' },
    { text: 'The Philippines spent over $50 million importing apples in 2022.', source: 'PSA Foreign Trade Statistics' },
    { text: 'In the Philippines, apples are among the top 5 most imported fruits.', source: 'Bureau of Plant Industry, Philippines' },
    { text: 'Vietnam imports over 100,000 tons of apples annually, mostly from the US and New Zealand.', source: 'Vietnam Customs Statistics' },
    { text: 'Apple imports to Vietnam grew by 15% between 2020 and 2023.', source: 'General Dept. of Vietnam Customs' },
    { text: 'Vietnamese consumers prefer Fuji and Gala apple varieties for their sweetness.', source: 'USDA Foreign Agricultural Service - Vietnam' },
    { text: 'Da Lat, Vietnam attempted experimental apple cultivation due to its cool climate.', source: 'Vietnam Academy of Agricultural Sciences (VAAS)' },
    { text: 'Vietnam ranks among the top 10 apple-importing countries in Asia.', source: 'UN Comtrade Database' },
    { text: 'In Vietnam, apples are commonly given as gifts during Tet (Lunar New Year).', source: 'VnExpress International' },
    { text: 'Newton reportedly discovered gravity watching an apple fall.', source: 'Royal Society of London Archives' },
  ],
  orange: [
    { text: 'Oranges are actually a hybrid of pomelo and mandarin.', source: 'Nature Journal, 2014' },
    { text: 'Brazil is the largest producer of oranges in the world.', source: 'FAO Statistics 2023' },
    { text: 'Orange peels contain more vitamin C than the fruit itself!', source: 'USDA Nutrient Database' },
    { text: 'The color orange was named after the fruit, not the other way.', source: 'Oxford English Dictionary' },
    { text: 'There are over 600 varieties of oranges worldwide.', source: 'University of California, Riverside Citrus Center' },
    { text: 'An orange tree can live and produce fruit for over 100 years.', source: 'California Citrus State Historic Park' },
    { text: 'Oranges originated in Southeast Asia around 2500 B.C.', source: 'Cambridge World History of Food' },
    { text: 'One orange tree can produce 60,000 flowers but only 1% become fruit.', source: 'Texas A&M AgriLife Extension' },
    { text: 'The white stuff on oranges is called "pith" — it\'s full of fiber!', source: 'Harvard Health Publishing' },
    { text: 'Oranges are the most commonly grown tree fruit in the world.', source: 'World Atlas Agriculture Data' },
    { text: 'A navel orange is named for its belly-button-like formation.', source: 'Sunkist Growers Inc.' },
    { text: 'Blood oranges get their color from anthocyanin pigment.', source: 'Journal of Agricultural and Food Chemistry' },
    { text: 'Oranges can be green outside and still be perfectly ripe.', source: 'Florida Dept. of Citrus' },
    { text: 'An average orange has 10 segments inside.', source: 'National Geographic Kids' },
    { text: 'The scent of oranges has been shown to reduce anxiety.', source: 'Journal of Alternative and Complementary Medicine' },
    { text: 'Ancient Chinese medicine used dried orange peel to treat coughs.', source: 'Chinese Pharmacopoeia' },
    { text: 'Rubbing orange peel on your skin can act as a natural mosquito repellent.', source: 'Journal of Insect Science' },
    { text: 'Oranges have more fiber than most other common fruits.', source: 'USDA Food Composition Database' },
    { text: 'The Philippines grows native "dalanghita" and "dalandan" orange varieties.', source: 'Bureau of Plant Industry, Philippines' },
    { text: 'Sagada in Mountain Province, Philippines is known for its sweet locally-grown oranges.', source: 'DA-CAR (Dept. of Agriculture - Cordillera)' },
    { text: 'The Philippine citrus industry produces around 90,000 metric tons annually.', source: 'Philippine Statistics Authority (PSA)' },
    { text: 'Filipino "calamansi" is a citrus hybrid closely related to oranges, used in almost every dish.', source: 'Philippine Council for Agriculture and Fisheries' },
    { text: 'Batangas province is one of the top citrus-producing regions in the Philippines.', source: 'DA Region IV-A, Philippines' },
    { text: 'Vietnam is one of the top citrus producers in Southeast Asia with over 1 million tons/year.', source: 'FAO Statistics - Vietnam' },
    { text: 'Vinh oranges from Nghe An province are considered the best oranges in Vietnam.', source: 'Vietnam Ministry of Agriculture and Rural Development' },
    { text: 'Ha Giang province in Vietnam produces prized "cam sanh" (king oranges).', source: 'VnExpress International' },
    { text: 'Vietnam\'s Mekong Delta is a major orange and citrus cultivation region.', source: 'Vietnam Academy of Agricultural Sciences (VAAS)' },
    { text: 'Vietnamese farmers use grafting techniques to grow oranges year-round.', source: 'Vietnam Journal of Agricultural Sciences' },
    { text: 'The "cam canh" orange from Hanoi is famous for its thin skin and sweet taste.', source: 'Hanoi Dept. of Agriculture' },
    { text: 'Orange trees in Vietnam can produce fruit for 30-50 years when well maintained.', source: 'National Institute of Fruit Trees, Vietnam' },
  ],
  mango: [
    { text: 'Mangoes are the national fruit of India, Pakistan, and the Philippines.', source: 'FAO Tropical Fruits Report' },
    { text: 'A mango tree can grow up to 100 feet tall!', source: 'Purdue University Horticulture' },
    { text: 'Mangoes belong to the same family as cashews and pistachios.', source: 'Britannica Encyclopedia' },
    { text: 'India produces about 50% of the world\'s mangoes.', source: 'FAO Statistics 2023' },
    { text: 'There are over 1,000 different varieties of mango.', source: 'International Mango Society' },
    { text: 'The paisley pattern is based on the shape of a mango!', source: 'Victoria and Albert Museum, London' },
    { text: 'Mango trees can bear fruit for over 300 years.', source: 'Journal of Tropical Agriculture' },
    { text: 'The Alphonso mango is considered the "King of Mangoes."', source: 'National Mango Board, India' },
    { text: 'The mango is technically a "drupe" — like a peach or cherry.', source: 'Botanical Society of America' },
    { text: 'Mangoes have been cultivated for over 4,000 years.', source: 'Cambridge World History of Food' },
    { text: 'Mangoes contain over 20 different vitamins and minerals.', source: 'USDA Nutrient Database' },
    { text: 'Alexander the Great discovered mangoes in India in 327 B.C.', source: 'Historical Atlas of the Ancient World' },
    { text: 'The Philippine "Carabao" mango (Manila Super Mango) was in the Guinness Book as the world\'s sweetest.', source: 'Guinness World Records, 1995' },
    { text: 'Guimaras Island in the Philippines is called the "Mango Capital of the Philippines."', source: 'Dept. of Tourism, Philippines' },
    { text: 'The Philippines is the world\'s 8th largest mango producer, with over 900,000 metric tons/year.', source: 'Philippine Statistics Authority (PSA)' },
    { text: 'Philippine mango exports earn over $60 million annually, shipped mostly as dried mango.', source: 'Philippine Exporters Confederation' },
    { text: 'Zambales, Pangasinan, and Cebu are the top mango-producing provinces in the Philippines.', source: 'Bureau of Agricultural Statistics, Philippines' },
    { text: 'Filipinos celebrate the "Manggahan Festival" in Guimaras every May for the mango harvest.', source: 'Philippine Festivals Foundation' },
    { text: 'Philippine dried mango by brands like 7D and Cebu Best are exported to over 50 countries.', source: 'Philippine Trade Training Center' },
    { text: 'The mango tree is considered sacred and is often planted near Filipino churches and homes.', source: 'Philippine Cultural Heritage Encyclopedia' },
    { text: 'Vietnam is the world\'s 13th largest mango producer with over 800,000 metric tons/year.', source: 'FAO Statistics - Vietnam' },
    { text: 'The "xoai cat Hoa Loc" mango from Tien Giang is Vietnam\'s most prized mango variety.', source: 'Vietnam Ministry of Agriculture' },
    { text: 'Khanh Hoa and Dong Nai provinces are major mango growing regions in Vietnam.', source: 'Vietnam Academy of Agricultural Sciences (VAAS)' },
    { text: 'Vietnam exports mangoes to China, Japan, South Korea, and Australia.', source: 'General Dept. of Vietnam Customs' },
    { text: 'Vietnamese green mango salad ("goi xoai") is a beloved street food staple.', source: 'VnExpress International' },
    { text: 'Vietnam\'s mango export revenue exceeded $180 million in 2023.', source: 'Vietnam Fruit and Vegetable Association' },
    { text: 'Mango sticky rice ("xoi xoai") is a popular Vietnamese and Southeast Asian dessert.', source: 'Southeast Asian Culinary Heritage Foundation' },
    { text: 'In Vietnam, mango trees are often grown in home gardens as both shade and fruit trees.', source: 'Vietnam Journal of Agricultural Sciences' },
    { text: 'The Mekong Delta produces over 40% of Vietnam\'s total mango output.', source: 'Southern Fruit Research Institute, Vietnam' },
    { text: 'Filipino and Vietnamese mango varieties share tropical flavor profiles prized in global markets.', source: 'ASEAN Agricultural Trade Report' },
  ],
  grapes: [
    { text: 'A single grape vine can produce 40 clusters per year.', source: 'University of California, Davis - Viticulture' },
    { text: 'Grapes explode if you microwave them — don\'t try it!', source: 'Proceedings of the National Academy of Sciences' },
    { text: 'It takes about 2.5 lbs of grapes to make one bottle of wine.', source: 'Wine Institute of California' },
    { text: 'Grapes are over 80% water — a great hydrating snack.', source: 'USDA Nutrient Database' },
    { text: 'The world\'s oldest grape vine is over 400 years old in Slovenia.', source: 'Guinness World Records' },
    { text: 'Raisins are dried grapes — they took 3 weeks in the sun!', source: 'Sun-Maid Growers of California' },
    { text: 'China is the largest producer of grapes in the world.', source: 'FAO Statistics 2023' },
    { text: 'Grapes come in red, green, black, yellow, pink, and purple.', source: 'International Organisation of Vine and Wine (OIV)' },
    { text: 'Table grapes and wine grapes are different varieties.', source: 'UC Davis Department of Viticulture' },
    { text: 'Grapes were first domesticated around 6000-8000 years ago.', source: 'Science Journal, 2011' },
    { text: 'Grape seeds contain powerful antioxidants called OPCs.', source: 'Journal of Nutrition' },
    { text: 'Resveratrol in grape skins may help protect the heart.', source: 'American Heart Association' },
    { text: 'There are roughly 10,000 grape varieties worldwide.', source: 'International Organisation of Vine and Wine (OIV)' },
    { text: 'Frozen grapes make a delicious natural candy alternative.', source: 'American Academy of Pediatrics' },
    { text: 'Grape leaves are edible and common in Mediterranean cooking.', source: 'Mediterranean Diet Foundation' },
    { text: 'The study of grapes and winemaking is called "viticulture."', source: 'Oxford Dictionary of Agriculture' },
    { text: 'The oldest known winery dates back 6,100 years to Armenia.', source: 'National Geographic, 2011' },
    { text: 'The heaviest bunch of grapes weighed 10.12 kg (22 lbs 4 oz).', source: 'Guinness World Records' },
    { text: 'La Union and Ilocos Norte are pioneering grape-growing provinces in the Philippines.', source: 'DA Region I, Philippines' },
    { text: 'The Philippines hosts a "Grapes Festival" in La Union every year celebrating the local harvest.', source: 'Dept. of Tourism - Region I, Philippines' },
    { text: 'Asingan, Pangasinan and Bauang, La Union are the top grape-producing towns in the Philippines.', source: 'Philippine Daily Inquirer' },
    { text: 'Philippine-grown grapes are mostly Cardinal and Red Globe table varieties.', source: 'Bureau of Plant Industry, Philippines' },
    { text: 'Filipino grape wine from Ilocos is a popular regional souvenir product.', source: 'DTI Region I, Philippines' },
    { text: 'Grape growing in the Philippines was introduced by Apolonio Samonte in 1972 in La Union.', source: 'La Union Provincial Government' },
    { text: 'Vietnam\'s Ninh Thuan province is the country\'s grape capital, producing 95% of all Vietnamese grapes.', source: 'Vietnam Ministry of Agriculture' },
    { text: 'Ninh Thuan, Vietnam grows over 25,000 tons of grapes per year in its dry, sunny climate.', source: 'Ninh Thuan Provincial Agriculture Dept.' },
    { text: 'Vietnamese "nho Ninh Thuan" grapes are famous for their sweet-tart flavor.', source: 'VnExpress International' },
    { text: 'Vietnam produces grape wine from Ninh Thuan grapes, with brands like Vang Dalat.', source: 'Vietnam Wine and Spirits Association' },
    { text: 'Phan Rang in Ninh Thuan has a Grape and Wine Festival annually celebrating the harvest.', source: 'Ninh Thuan Dept. of Tourism' },
    { text: 'Both the Philippines and Vietnam grow grapes in tropical climates by managing dry/wet cycles.', source: 'ASEAN Journal of Agricultural Sciences' },
  ],
  banana: [
    { text: 'Bananas are technically berries, but strawberries are not!', source: 'Stanford University Biology Dept.' },
    { text: 'A cluster of bananas is called a "hand," each banana a "finger."', source: 'Chiquita Brands International' },
    { text: 'Bananas share about 60% of their DNA with humans!', source: 'National Human Genome Research Institute' },
    { text: 'Bananas are naturally slightly radioactive (due to potassium).', source: 'American Nuclear Society' },
    { text: 'India is the world\'s largest producer of bananas.', source: 'FAO Statistics 2023' },
    { text: 'Bananas don\'t grow on trees — they grow on giant herbs!', source: 'Smithsonian Tropical Research Institute' },
    { text: 'There are over 1,000 varieties of bananas in the world.', source: 'Bioversity International' },
    { text: 'The Cavendish banana makes up 47% of global production.', source: 'FAO Global Banana Market Review' },
    { text: 'Bananas were first domesticated in Papua New Guinea.', source: 'Science Journal, 2003' },
    { text: 'Bananas ripen faster near other fruits due to ethylene gas.', source: 'UC Davis Postharvest Technology Center' },
    { text: 'Green bananas have more starch, yellow ones more sugar.', source: 'Harvard T.H. Chan School of Public Health' },
    { text: 'Banana fiber can be woven into fabric — banana silk!', source: 'Textile Research Journal' },
    { text: 'The scientific name "Musa sapientum" means "fruit of the wise men."', source: 'Carl Linnaeus, Species Plantarum, 1753' },
    { text: 'Bananas produce a natural chemical that makes people happy.', source: 'Journal of Nutritional Neuroscience' },
    { text: 'A banana plant produces only one bunch then dies back.', source: 'Purdue University Horticulture' },
    { text: 'The heaviest bunch of bananas weighed 130 lbs (59 kg).', source: 'Guinness World Records' },
    { text: 'Banana plants can grow 2 feet in a single day.', source: 'Royal Horticultural Society' },
    { text: 'The Philippines is the world\'s 2nd largest banana exporter after Ecuador.', source: 'FAO Statistics 2023' },
    { text: 'Mindanao produces over 85% of all Philippine bananas, especially Davao Region.', source: 'Philippine Statistics Authority (PSA)' },
    { text: 'The Philippine banana industry employs over 400,000 workers directly.', source: 'Philippine Banana Growers & Exporters Association (PBGEA)' },
    { text: 'Philippine banana exports generate over $2 billion in revenue annually.', source: 'Bangko Sentral ng Pilipinas (BSP)' },
    { text: 'The "saba" banana is a staple cooking banana in the Philippines used for turon and banana cue.', source: 'Philippine Council for Agriculture and Fisheries' },
    { text: 'Filipinos have over 50 native banana varieties including lakatan, latundan, and señorita.', source: 'Bureau of Plant Industry, Philippines' },
    { text: 'The Philippines ships Cavendish bananas mainly to Japan, China, South Korea, and the Middle East.', source: 'PBGEA Export Report 2023' },
    { text: 'Vietnam is the largest banana exporter in Southeast Asia after the Philippines.', source: 'FAO Statistics - Vietnam' },
    { text: 'Vietnam produced over 2.4 million tons of bananas in 2023.', source: 'Vietnam Ministry of Agriculture' },
    { text: 'Gia Lai and Dak Lak provinces in Vietnam\'s Central Highlands are major banana regions.', source: 'Vietnam Academy of Agricultural Sciences (VAAS)' },
    { text: 'Vietnam exports bananas mainly to China, accounting for over 90% of its banana exports.', source: 'General Dept. of Vietnam Customs' },
    { text: 'Vietnamese "chuoi ngu" (dwarf banana) is a beloved local dessert banana.', source: 'VnExpress International' },
    { text: '"Banh chuoi" (banana cake) is a traditional Vietnamese dessert found across the country.', source: 'Vietnam Culinary Heritage Foundation' },
  ],
};

/** Pick a random fun fact for a fruit (returns {text, source}) */
export function getRandomFact(fruit) {
  const facts = FRUIT_FUN_FACTS[fruit] || FRUIT_FUN_FACTS.apple;
  return facts[Math.floor(Math.random() * facts.length)];
}

/** Pick N unique random fun facts for a fruit (returns [{text, source}, ...]) */
export function getRandomFacts(fruit, count = 3) {
  const facts = [...(FRUIT_FUN_FACTS[fruit] || FRUIT_FUN_FACTS.apple)];
  const result = [];
  const n = Math.min(count, facts.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * facts.length);
    result.push(facts[idx]);
    facts.splice(idx, 1);
  }
  return result;
}

/** Health info about each fruit */
export const FRUIT_HEALTH_INFO = {
  apple: {
    calories: '95 kcal', keyNutrients: 'Fiber, Vitamin C, Potassium',
    benefits: 'Supports heart health, aids digestion, may reduce diabetes risk.',
    storage: 'Refrigerate for 4-6 weeks. Keep away from other fruits.',
    freshTip: 'Firm, smooth skin, crisp snap when bitten.',
    rottenSign: 'Soft mushy spots, brown discoloration, fermented smell.',
  },
  orange: {
    calories: '62 kcal', keyNutrients: 'Vitamin C, Folate, Thiamine',
    benefits: 'Boosts immunity, improves skin, helps absorb iron.',
    storage: 'Refrigerate for 3 weeks. Room temp for 1 week.',
    freshTip: 'Heavy for its size, firm bright-colored skin.',
    rottenSign: 'Mold spots, very soft texture, sour fermented odor.',
  },
  mango: {
    calories: '99 kcal', keyNutrients: 'Vitamin A, Vitamin C, Folate',
    benefits: 'Promotes eye health, boosts immunity, supports gut health.',
    storage: 'Ripen at room temp, then refrigerate for 5 days.',
    freshTip: 'Gives slightly when pressed, fruity aroma at stem.',
    rottenSign: 'Large black spots, oozing juice, alcoholic smell.',
  },
  grapes: {
    calories: '62 kcal', keyNutrients: 'Vitamin C, Vitamin K, Antioxidants',
    benefits: 'Rich in antioxidants, supports heart health, may improve memory.',
    storage: 'Refrigerate unwashed in breathable bag for 2 weeks.',
    freshTip: 'Plump, firmly attached to green flexible stems.',
    rottenSign: 'Shriveled, brown stems, mushy or moldy skin.',
  },
  banana: {
    calories: '105 kcal', keyNutrients: 'Potassium, Vitamin B6, Vitamin C',
    benefits: 'Great energy source, supports muscles, aids digestion.',
    storage: 'Room temp until ripe. Refrigerate to slow ripening.',
    freshTip: 'Bright yellow, small brown spots = peak sweetness.',
    rottenSign: 'Completely black skin, very mushy, fermented smell.',
  },
};
