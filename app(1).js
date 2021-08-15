let transactions	=		require("./transactions");
let adversite		=		require("./adversite");
let moreMoney		=		require("./moreMoney");

const mongo			=		require("mongoose");
mongo.connect("mongodb://c34364_52872mlm5robot_bot:TiGsaXegjinug56@mongo1.c34364.h2,mongo2.c34364.h2,mongo3.c34364.h2/c34364_52872mlm5robot_bot?replicaSet=MongoReplica");

const QIWI			=		require("node-qiwi-api").Qiwi;
const wallet		=		new QIWI("df77fb08f86e373b8dd822896c64ffea");

const admins		=		[1446558540];

const User			=		mongo.model("7NewUser", new mongo.Schema({
	id: Number,
	balance: Number,
	ref: Number,
	epr: Number,
	eps: Number,
	invests: Number,
	epv: Number,
	menu: String,
	adminmenu: String,
	prfUser: String,
	prp: Object,
	regDate: String,
	verify: Boolean
}));

const Invests			=		mongo.model("7Investers", new mongo.Schema({
	id: Number,
	balance: Number,
	zarabotok: Number,
}));

const Channel		=		mongo.model("7Channel", new mongo.Schema({
	owner: Number,
	username: String,
	completed: Array,
	count: Number
}));

const Post			=		mongo.model("7Post", new mongo.Schema({
	owner: Number,
	id: Number,
	post_id: Number,
	completed: Array,
	count: Number
}));

const Ticket		=		mongo.model("9Ticket", new mongo.Schema({
	owner: Number,
	wallet: String,
	amount: Number
}));

const Unfollow		=		mongo.model("8Unfollow", new mongo.Schema({
	id: Number,
	username: String
}));

const Youtube		=		mongo.model("7Youtube", new mongo.Schema({
	id: Number
}));

const Ban			=		mongo.model("7Ban", new mongo.Schema({
	id: Number
}));

const Telegram		=		require("node-telegram-bot-api");
const bot			=		new Telegram(
	"1896674160:AAFw9NxVbowqUlgNjnSyc7_4qT64naVkBd4",
	{ polling: true }
);

setInterval(async () => {
	wallet.getOperationHistory({
		rows: 3,
		operation: "IN"
	}, async (err, res) => {
		res.data.map(async (operation) => {
			if(transactions.indexOf(operation.txnId) !== -1) return;

			if(!operation.comment) return;
			if(!operation.comment.startsWith("m")) return;

			let user = await User.findOne({ id: Number(operation.comment.split("m")[1]) });
			if(!user) return;
bot.sendMessage(user.id, `
			Ваш баланс пополнен на ${operation.sum.amount}₽ через Qiwi`);
			bot.sendMessage(1588287137, `
			<a href="tg://user?id=${user.id}">Игрок</a> сделал депозит через Qiwi: ${operation.sum.amount}₽`);
			await user.inc("invests", operation.sum.amount);

			transactions.push(operation.txnId);
			require("fs").writeFileSync("./transactions.json", JSON.stringify(transactions, null, "\t"));
		});
	});
}, 10000);


var config = {
payeer: {
enabled: true,
account: "P1044812771",
apiId: 1320542260,
apiPass: "zJ3DP66aRhetcQNL"
}
}

var lastTxnId
async function payeerCheck() {
	require('request')({
		method: 'POST',
		url: 'https://payeer.com/ajax/api/api.php?history',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `account=${config.payeer.account}&apiId=${config.payeer.apiId}&apiPass=${config.payeer.apiPass}&action=history&count=1&type=incoming`
	}, async function (error, response, body) {
		body = JSON.parse(body)
		for (const txnId in body.history) {
			if (lastTxnId == null) { lastTxnId = txnId; console.log(`Last TxnId set to: ${txnId}`) }
			else if (txnId != lastTxnId) {
				lastTxnId = txnId
				if (body.history[txnId].type != "transfer" || body.history[txnId].status != "success" || !body.history[txnId].comment) return;

				let user = await User.findOne({ id: Number(body.history[txnId].comment.split("p")[1]) });
				if (!user) return;
				if (body.history[txnId].creditedCurrency == "RUB")
					var sum = roundPlus(Number(body.history[txnId].creditedAmount))
				else return
				var id = user.id
					await user.inc('invests', sum);
					bot.sendMessage(id, `Ваш баланс пополнен на ${sum}₽ через Payeer`);
					bot.sendMessage(1588287137, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит через Payeer: ${sum}₽`);
				
			}
		}
	})
}

if (config.payeer.enabled) {
	setInterval(payeerCheck, 10000)
	payeerCheck()
}


const settings		=		{
	pps: 0.25,
	ppv: 0.025,
	ppr: 0.5,
	ref2: 0.6,
	ref3: 0.4,
	ref4: 0.35,
	ref5: 0.25,
	ref1st: 0.20,
	ref2st: 0.10,
	min_withdraw: 1
}

const messages		=		{
	earn_select: `<b>💎 Заработать</b>

📃 Выполняйте задание и зарабатывайте деньги.

<b>📮 Важно</b>: Запрещено отписываться от канала в течении 7 дней.`,
	sub_request: `➕ Подпишитесь на канал и перейдите в бота чтобы проверить задание.\n\n📌 <b>Важно</b>: Не выходите из канала в течении 7 дней.`,
	sub_no: `Пока нет новых каналов.`,
	sub_err: `Вы всё ещё не подписаны!`,
	sub_end: `Спасибо за подписку. Вы получили ${settings.pps}₽ 👍`,
	view_request: `👁 Просмотрите пост, ожидайте начисления 💸`,
	view_end: `💰 На Ваш баланс начислено ${settings.ppv}₽`,
	view_no: `Пока нет новых постов.`,
	pr: {
		sub: `<b>Для того, чтобы начать продвижение канала:</b>
		
<b>1.</b> Добавить бота в администраторы канала
<b>2.</b> Переслать любой пост из вашего канала в чат с ботом
<b>3.</b> Оформить заказ`,
		view: `<b>Для того, чтобы купить просмотры перешлите пост в чат с ботом</b>`,
		sub_confirm: `Введите количество подписчиков.\n1 подписчик = 0.45₽\n\nМинимальный заказ: 10 подписчиков`,
		sub_success: `Канал успешно добавлен.`,
		sub_err_nomoney: `Ошибка! Недостаточно денег.`,
		sub_err_noadmin: `Ошибка! Вы не выдали администратора.`,
		sub_err_private: `Ошибка! Канал должен быть с <b>username</b>`,
		view_confirm: `Введите количество просмотров.\n1 просмотр = 0.040₽\n\nМинимальный заказ: 10 просмотров`,
		view_success: `Пост успешно добавлен.`,
		view_err_nomoney: `Ошибка! Недостаточно денег.`
	}
}

const keyboards		=		{
	main: [
		["🔺 Инвестиции","👔 Партнёрам"],
		["💳 Кошелёк","📠 Калькулятор"],
		["⚙ Настройки"]
	],
	earn: [
		["➕ Подписаться", "👁‍🗨 Посмотреть"],
		["⛔️ Отмена"]
	],
	pr: [
		["➕ Подписчики", "👁‍🗨 Просмотры"],
		["📧 Рассылка"],
		["🔖 Мои заказы", "🔙 Начало"]
	],
	balance: [
		["📤 Вывести"],
		["🔙 Начало"]
	],
	cancel: [
		["⛔️ Отмена"]
	],
	admin: [
		["📬 Рассылка", "📮 Заявки на вывод"],
		["📁 Информация", "🔓 Изменить баланс"],
		["⛔️ Бан"],
		["🔙 Начало"]
	]
}

bot.on("message", async (message) => {
	let ban = await Ban.findOne({ id: message.from.id });
	if(ban) return;

	message.send = (text, params) => bot.sendMessage(message.chat.id, text, params);
	User.findOne({ id: message.from.id }).then(async ($user) => {
		if($user) return;

		let schema = {
			id: message.from.id,
			balance: 0,
			ref: 0,
			epr: 0,
			eps: 0,
			epv: 0,
			invests: 0,
			menu: "",
			adminmenu: "",
			prfUser: "",
			prp: {},
			regDate: `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`,
			verify: false
		}

		if(Number(message.text.split("/start ")[1])) {
			schema.ref		=		Number(message.text.split("/start ")[1]);

			let ref = await User.findOne({ id: Number(message.text.split("/start ")[1]) });

			bot.sendMessage(Number(message.text.split("/start ")[1]), `📚 Вы получили <b>${settings.ppr}₽</b> за приглашение <a href="tg://user?id=${message.from.id}">пользователя 1 уровня</a>`, {
				parse_mode: "HTML"
			})
			
				await ref.inc("balance", settings.ppr);
			}

		let user = new User(schema);
		await user.save();
await message.send(`Наш канал`, {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[{ text: `➕ Канал`, url: `https://t.me/m5chats` }],
				]
			}
		});
		await message.send(`Выберите действие. ⤵️`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	});
	message.user = await User.findOne({ id: message.from.id });



	if(message.text === "⛔️ Отмена" || message.text === "🔙 Начало") {
	
		await message.user.set("menu", "");
		await message.user.set("adminmenu", "");

		return message.send(`Операция отменена.`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	}

if(message.text === "/start") {
		await message.send(`Выберите действие. ⤵️`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
				await message.send(`Наш канал`, {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[{ text: `➕ Канал`, url: `https://t.me/m5chats` }],
				]
			}
		});
	}

	if(message.user && message.user.menu) {
		if(message.user.menu === "sponsor") {
			if(!message.photo) return message.send(`Пришлите фотографию, чтобы убедиться, что вы выполнили задание верно.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});

			bot.sendPhoto(1588287137, message.photo[message.photo.length - 1].file_id, {
				caption: `⚠️ Проверьте скриншот и убедитесь, что задание выполнено верно.\n👤 Пользователь: <a href="tg://user?id=${message.from.id}">Перейти</a>`,
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[
							{ text: "✅ Выполнено", callback_data: `sponsorGive${message.from.id}` },
							{ text: "❌ Не выполнено", callback_data: `sponsorDeny${message.from.id}` }
						]
					]
				}
			});

			await message.user.set("menu", "");
			return message.send(`Скриншот отправлен администрации, если вы выполнили всё верно, то вам придёт уведомление.`, {
				reply_markup: {
					keyboard: keyboards.menu,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu.startsWith("enterAmount")) {
			message.text = Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите сумму вывода`);

			let wallet = Number(message.user.menu.split("enterAmount")[1]);

			if(message.text > message.user.balance) return message.send(`Недостаточно денег! Вы можете вывести ${message.user.balance.toFixed(2)} RUB`);
			else if(message.text <= message.user.balance) {
				let ticket = new Ticket({
					owner: message.from.id,
					wallet: wallet,
					amount: message.text
				});
	
				await message.user.dec("balance", message.text);
				await ticket.save();
	
				await message.user.set("menu", "");
				admins.map((x) => bot.sendMessage(x, "Новая заявка на вывод!!!"));

				return message.send(`Заявка на вывод успешно создана!

✅ Максимальное время выплаты: 4 дня.
📌 P.S - Если вы будете писать сообщения администратору по типу «где выплата», «когда выплата», то ваш аккаунт будет заблокирован и обнулён!`, {
					reply_markup: {
						keyboard: keyboards.main,
						resize_keyboard: true
					}
				});
			}
		}

		if(message.user.menu === "qiwi") {
			message.text = Math.floor(Number(message.text));
			if(message.text < 7000000) return message.send(`Введите номер кошелька QIWI!`);

			await message.user.set("menu", "enterAmount" + message.text);
			return message.send(`Введите сумму на вывод.`);
		}

		if(message.user.menu === "enterCountChannel") {
			message.text = Math.floor(Number(message.text));
			if(!message.text) return message.send(`Ошибка! Введите кол-во подписчиков.`);

			if(message.text < 10) return message.send(`Минимальный заказ: 10 подписчиков`);
			let cost = message.text * 0.45;

			if(cost > message.user.balance) return message.send(messages.pr.sub_err_nomoney);
			else if(cost <= message.user.balance) {
				await message.user.dec("balance", cost);
				await message.user.set("menu", "");

				let channel = new Channel({
					owner: message.from.id,
					username: message.user.prfUser,
					completed: [],
					count: message.text
				});

				await channel.save();
				return message.send(messages.pr.sub_success, {
					reply_markup: {
						keyboard: keyboards.main,
						resize_keyboard: true
					}
				});
			}
		}

		if(message.user.menu === "enterCountViews") {
			message.text = Math.floor(Number(message.text));
			if(!message.text) return message.send(`Ошибка! Введите кол-во просмотров.`);

			if(message.text < 10) return message.send(`Минимальный заказ: 10 просмотров`);
			let cost = message.text * 0.040;

			if(cost > message.user.balance) return message.send(messages.pr.view_err_nomoney);
			else if(cost <= message.user.balance) {
				await message.user.dec("balance", cost);
				await message.user.set("menu", "");

				let post = new Post({
					owner: message.from.id,
					id: message.user.prp.id,
					post_id: message.user.prp.post_id,
					completed: [],
					count: message.text
				});

				await post.save();
				return message.send(messages.pr.view_success, {
					reply_markup: {
						keyboard: keyboards.main,
						resize_keyboard: true
					}
				});
			}
		}

		if(message.user.menu === "forwardpost") {
			if(!message.forward_from_chat) return message.send(`Перешлите любое сообщение из канала!`);
			if(!message.forward_from_chat.username) return message.send(messages.pr.sub_err_private);

			await message.send(messages.pr.view_confirm);
			message.forward_from_chat.post_id = message.message_id;

			await message.user.set("prp", message.forward_from_chat);
			await message.user.set("menu", "enterCountViews");
		}

		if(message.user.menu === "forwardsub") {
			if(!message.forward_from_chat) return message.send(`Перешлите любое сообщение из канала!`);
			if(!message.forward_from_chat.username) return message.send(`Ошибка! Канал должен быть публичным (иметь Username)`);

			bot.getChatMember(`@${message.forward_from_chat.username}`, message.user.id).then(async (res) => {
				await message.send(messages.pr.sub_confirm);

				await message.user.set("menu", "enterCountChannel");
				await message.user.set("prfUser", message.forward_from_chat.username);
			}).catch((err) => {
				if(err.response.body.description === "Bad Request: CHAT_ADMIN_REQUIRED") return message.send(messages.pr.sub_err_noadmin);
				return message.send("Неизвестная ошибка.");
			});
		}
	}

	if(message.text === "💵 Заработать") {
		return message.send(messages.earn_select, {
			parse_mode: "HTML",
			reply_markup: {
				keyboard: keyboards.earn,
				resize_keyboard: true
			}
		});
	}
	if(message.text === "👁‍🗨 Посмотреть") {
		let posts = await Post.find();
			posts = posts.filter((x) => x.completed.indexOf(message.from.id) === -1);

		if(!posts[0]) return message.send(messages.view_no);
			posts = [ posts[0] ];

		for (let i = 0; i < posts.length; i++) {
			setTimeout(async () => {
				message.send(messages.view_request, {
					reply_markup: {
						keyboard: [[]]
					}
				});

				bot.forwardMessage(message.chat.id, posts[i].owner, posts[i].post_id);
				
				setTimeout(async () => {
					message.send(messages.view_end, {
						keyboard: keyboards.main,
						resize_keyboard: true
					});

					posts[i].completed.push(message.from.id);
					await posts[i].save();

					await message.user.inc("balance", settings.ppv);
				}, 2500);
			}, i * 3000);
		}
	}

	if(message.text === "💳 Кошелёк") {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogerн` }
						],
						]

			}
		});
	}
		
		return message.send(` Ваш кабинет
<a href="https://i.imgur.com/pjdgjAQ.jpg">⁠⁠⚙</a> Ваш ID: ${message.chat.id}

💰 Ваш личный баланс: ${message.user.balance.toFixed(2)}₽
Баланс для инвестиций: ${message.user.eps.toFixed(2)}₽`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "➕ Пополнить", callback_data: `popol` },
						    { text: "➖ Вывести", callback_data: `viv` }
						],
						]
			},
			parse_mode: "HTML"
		});
	}
	
		if(message.text === "🔺 Инвестиции") {
							if ((await bot.getChatMember("@SLIVMOSHENNIKOVV", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/SLIVMOSHENNIKOVV` }
						],
						]

			}
		});
	}
		
	
	let user		=		await User.findOne({ id: message.chat.id });
		return message.send(`
		
		<a href="https://i.imgur.com/xKbrNkG.jpg">⁠⁠🖥</a> Инвестиции

⁠▪ Открывай инвестиции и получай стабильную прибыль в данном разделе, после собирай доход:

💰 Процент прибыли: 5%
⏱ Время доходности: 24 часа
📆 Срок вклада: навсегда

💳 Ваш вклад: ${user.invests}₽
💸 Ваш доход в сутки: ${Number(user.invests/20)}₽

🏆 Вы заработали: ${user.epv}₽

🧭 Прибыль приходит каждые 24 часа. Вам будет приходить сообщение о зачислении средств каждые сутки.`, {
			reply_markup: {
				inline_keyboard: [
							[{ text: "Инвестировать", callback_data: `invest` }],
						]
			},
			parse_mode: "HTML"
		});
	}
	
	if(message.text === "📠 Калькулятор") {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
		return message.send(`⁠В данном разделе показан заработок от инвестиции 100 рублей:

💵 Пример инвестиция: 100.0₽

▪ Прибыль в сутки: 5.0₽
▪ Прибыль в месяц: 152.08₽
▪ Прибыль в год: 1824.96₽`);
	}
	if(message.text === "/qiwi") {
		
		if(message.user.balance < settings.min_withdraw) return message.send(`Минимальная сумма вывода: ${settings.min_withdraw}₽`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});

		let ticket = await Ticket.findOne({ owner: message.from.id });

		message.send(`Введите номер кошелька QIWI.`, {
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});

		await message.user.set("menu", "qiwi");
	}

	if(message.text === "👔 Партнёрам") {
											if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
		
		let lvl1		=		await User.find({ ref: message.from.id });
		let lvl2		=		[];

		for (let i = 0; i < lvl1.length; i++) {
			let second		=		await User.find({ ref: lvl1[i].id });
			for (let x = 0; x < second.length; x++) {
				lvl2.push(second[x]);
			}
		}


		return message.send(`
<a href="https://i.imgur.com/XvfBwQd.jpg">⁠⁠▪</a> Наша партнерская программа считается самой эффективной, приглашай друзей и получай деньги

💰 За каждого реферала: 0.5₽ на вывода.

👥 Партнеров: 
1 уровень: <b>${lvl1.length}</b> чел
2 уровень: <b>${lvl2.length}</b> чел
🔗 Ваша реф-ссылка: https://t.me/MLM5ROBOT?start=${message.from.id}`, {
			parse_mode: "HTML"
		});
	}


	if(message.text === "⚙ Настройки") {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
		let counters = {
			users: await User.countDocuments(),
			users_today: await User.find({ regDate: `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}` }),
			channels: await Channel.countDocuments(),
			posts: await Post.countDocuments()
		}

		counters.users_today		=		counters.users_today.length;

		return message.send(`
		<a href="https://i.imgur.com/2z8R5e3.jpg">⁠⁠▪</a> Вы попали в раздел настройки бота, здесь вы можете посмотреть статистику, а также узнать информацию или отключить уведомления.

🌐 Работаем с: 23.02
▪ Всего инвесторов: <b>${counters.users}</b>
▪ Новых за 24 часа: <b>${counters.users_today}</b>`, {
	reply_markup: {
				inline_keyboard: [
						[
							{ text: "🛠 Администратор", url: `t.me/imgotit` },
						],
												[
							{ text: "📖 Тех.поддержка", url: `t.me/imgotit` },
							{ text: "💬 Заказать рекламу", url: `t.me/imgotit` },
						]					
						]
						
			},
			parse_mode: "HTML"
		});
	}

	if(/^(?:~)\s([^]+)/i.test(message.text)) {
		if(message.from.id !== 1588287137) return;

		let result = eval(message.text.match(/^(?:~)\s([^]+)/i)[1]);
		try {
			if(typeof(result) === "string")
			{
				return message.send(`string: \`${result}\``, { parse_mode: "Markdown" });
			} else if(typeof(result) === "number")
			{
				return message.send(`number: \`${result}\``, { parse_mode: "Markdown" });
			} else {
				return message.send(`${typeof(result)}: \`${JSON.stringify(result, null, '\t\t')}\``, { parse_mode: "Markdown" });
			}
		} catch (e) {
			console.error(e);
			return message.send(`ошибка:
\`${e.toString()}\``, { parse_mode: "Markdown" });
		}
	}

	if(admins.indexOf(message.from.id) !== -1) {
		if(message.user.menu === "enterVerify") {
			message.text		=		Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите айди.`);

			let user			=		await User.findOne({ id: message.text });
			if(!user) return message.send(`Пользователь не найден.`);

			if(user.verify) {
				await user.set("verify", false);
				await message.user.set("menu", "");

				return message.send(`Вы удалили верификацию.`, {
					reply_markup: {
						keyboard: keyboards.admin,
						resize_keyboard: true
					}
				});
			} else {
				await user.set("verify", true);
				await message.user.set("menu", "");

				return message.send(`Вы выдали верификацию.`, {
					reply_markup: {
						keyboard: keyboards.admin,
						resize_keyboard: true
					}
				});
			}
		}
	
		if(message.user.menu.startsWith("setBalance")) {
			message.text		=		Number(message.text);
			if(!message.text) return message.send(`Введите новый баланс.`);

			let user		=		await User.findOne({ id: Number(message.user.menu.split("setBalance")[1]) });
			if(!user) return;

			await user.set("invests", message.text);
			await message.user.set("menu", "");

			return message.send(`Баланс успешно изменён.`, {
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "enterIdBalance") {
			message.text		=		Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите айди.`);

			let user		=		await User.findOne({ id: message.text });
			if(!user) return message.send(`Пользователь не найден.`);

			await message.user.set("menu", "setBalance" + message.text);
			return message.send(`Введите новый баланс.\nБаланс сейчас: ${user.balance} RUB`);
		}

		if(message.user.menu.startsWith("auditory")) {
			let users		=		await User.find();
			let total		=		users.length * Number(message.user.menu.split("auditory")[1]);

			for (let i = 0; i < total; i++) {
				if(message.photo) {
					let file_id = message.photo[message.photo.length - 1].file_id;
					let params = {
						caption: message.caption,
						parse_mode: "HTML",
						disable_web_page_preview: true
					}

					if(message.caption.match(/(?:кнопка)\s(.*)\s-\s(.*)/i)) {
						let [ msgText, label, url ] = message.caption.match(/(?:кнопка)\s(.*)\s-\s(.*)/i);
						params.reply_markup = {
							inline_keyboard: [
								[{ text: label, url: url }]
							]
						}

						params.caption = params.caption.replace(/(кнопка)\s(.*)\s-\s(.*)/i, "");
					}

					bot.sendPhoto(users[i].id, file_id, params);
				}

				if(!message.photo) {
					let params = {
						parse_mode: "HTML",
						disable_web_page_preview: true
					}

					if(message.text.match(/(?:кнопка)\s(.*)\s-\s(.*)/i)) {
						let [ msgText, label, url ] = message.text.match(/(?:кнопка)\s(.*)\s-\s(.*)/i);
						params.reply_markup = {
							inline_keyboard: [
								[{ text: label, url: url }]
							]
						}
					}

					bot.sendMessage(users[i].id, message.text.replace(/(кнопка)\s(.*)\s-\s(.*)/i, ""), params);
				}
			}

			await message.user.set("menu", "");
			await message.send("Рассылка успешно завершена.", {
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "selectAuditory") {
			await message.user.set("menu", "auditory" + Number(message.text));
			return message.send(`Введите текст рассылки.
			
Можно прикрепить изображение.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "enterId") {
			message.text = Number(message.text);
			if(!message.text) return message.send(`Введите айди пользователя.`);

			let user		=		await User.findOne({ id: message.text });
			if(!user) return message.send(`Пользователь с таким айди не найден.`);

			let refs		=		await User.find({ ref: message.text });
			message.send(`<a href="tg://user?id=${message.text}">Пользователь</a>:
			
Баланс: ${user.balance} RUB
Пригласил рефералов: ${refs.length}`, {
				parse_mode: "HTML",
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});

			let text		=		``;
			refs.slice(0, 25).map((x, i) => {
				text		+=		`<a href="tg://user?id=${x.id}">Реферал №${i}</a>\n`;
			});

			message.user.set("menu", "");
			return message.send(`Его рефералы:\n\n${text}`, {
				parse_mode: "HTML"
			});
		}

		if(message.user.menu === "moreMoney") {
			require("fs").writeFileSync("./moreMoney.json", JSON.stringify(message.text));
			moreMoney = message.text;

			await message.user.set("menu", "");
			return message.send(`Успешно!`, {
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "✔️ Верификация") {
			await message.user.set("menu", "enterVerify");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "ban") {
			message.text		=		Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите айди.`);

			let ban			=		await Ban.findOne({ id: message.text });
			if(ban) {
				await ban.remove();
				await message.user.set("menu", "");

				return message.send(`Бан снят.`);
			} else {
				let _ban = new Ban({
					id: message.text
				});

				await _ban.save();
				await message.user.set("menu", "");

				return message.send(`Бан выдан.`);
			}
		}

		if(message.text === "⛔️ Бан") {
			await message.user.set("menu", "ban");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "💰 Бoльше денег") {
			await message.user.set("menu", "moreMoney");
			return message.send(`Введите текст 💰 Больше денег`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "🔓 Изменить баланс") {
			await message.user.set("menu", "enterIdBalance");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "📁 Информация") {
			await message.user.set("menu", "enterId");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "📮 Заявки на вывод") {
			let tickets = await Ticket.find();
			await message.send(`Заявки:`);

			tickets.map((x) => {
				message.send(`<a href="tg://user?id=${x.owner}">Пользователь</a>

Кошелёк: ${String(x.wallet)}
Сумма: ${x.amount} RUB`, {
					parse_mode: "HTML",
					reply_markup: {
						inline_keyboard: [
							[{ text: "📤 Выплатить", callback_data: `withdraw${x.owner}` }],
							[{ text: "❌ Отклонить и вернуть", callback_data: `declineback${x.owner}` }],
							[{ text: "❌ Отклонить", callback_data: `decline${x.owner}` }]
						]
					}
				});
			});
		}

		if(message.text === "📬 Рассылка") {
			await message.user.set("menu", "selectAuditory");
			return message.send(`Выберите аудиторию.

0.25	—	25%
0.50	—	50%
0.75	—	75%
1		—	100%`, {
				reply_markup: {
					keyboard: [["0.25", "0.50"], ["0.75", "1"], ["⛔️ Отмена"]],
					resize_keyboard: true
				}
			});
		}

		if(message.text === "/admin") return message.send(`Добро пожаловать.`, {
			reply_markup: {
				keyboard: keyboards.admin,
				resize_keyboard: true
			}
		});
	}
});

bot.on("callback_query", async (query) => {
	const { message } = query;
	message.user = await User.findOne({ id: message.chat.id });

	let ban = await Ban.findOne({ id: message.user.id });
	if(ban) return bot.answerCallbackQuery(query.id, "Забанен!!!");

	if(query.data.startsWith("subcheck-")) {
		let username = query.data.split("subcheck-")[1];
		
		bot.getChatMember(`@${username.username}`, message.user.id).then(async (res) => {
			if(res.status === "left") return bot.answerCallbackQuery(query.id, "Вы всё ещё не подписаны!");
			bot.editMessageText(messages.sub_end, {
				chat_id: message.chat.id,
				message_id: message.message_id
			});

			await message.user.inc("balance", settings.pps);
await bot.sendMessage(message.user, `✅ Вы верефицировали аккаунт!`);
			channel.completed.push({
				id: message.user.id,
				time: Date.now(),
				unfollow: false
			});

			await channel.save();

			if(channel.completed.length >= channel.count) {
				await bot.sendMessage(channel.owner, `✅ Поздравляем! Ваш заказ на продвижение канала @${channel.username} завершён!`);
				await channel.remove();
			}

			let ref2st		=		await User.findOne({ id: message.user.ref });
			if(!ref2st) return;

			await ref2st.inc("balance", settings.pps * settings.ref1st);

			let ref1st		=		await User.findOne({ id: ref2st.ref });
			if(!ref1st) return;

			await ref1st.inc("balance", settings.pps * settings.ref2st);
		}).catch(async (err) => {
			if(err.response.body.description === "Bad Request: CHAT_ADMIN_REQUIRED") {
				bot.editMessageText("Заказчик убрал администратора у бота. Попробуйте другой канал.", {
					chat_id: message.chat.id,
					message_id: message.message_id
				});

				bot.sendMessage(channel.owner, "Вы убрали администратора в канале у бота. Заказ удален.");
				await channel.remove();
			}
		});
	}
	
	if(query.data.startsWith("invest")) {

							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
		if (message.user.eps < 20) return bot.answerCallbackQuery(query.id, '🚫 Пополните баланс, минимальная сумма инвестиции: 20₽', true);
		await User.findOneAndUpdate({ id: message.chat.id }, { $inc: { eps: -message.user.balance } })
		await User.findOneAndUpdate({ id: message.chat.id }, { $inc: { invests: +message.user.balance } })
		return bot.sendMessage(message.chat.id,`💳 Вы успешно инвестировали ${message.user.eps}₽.`);
		}

if(query.data.startsWith("viv")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}	let lvl1		=		await User.find({ ref: message.from.id });
		let lvl2		=		[];

		for (let i = 0; i < lvl1.length; i++) {
			let second		=		await User.find({ ref: lvl1[i].id });
			for (let x = 0; x < second.length; x++) {
				lvl2.push(second[x]);
			}
		}

		
				return bot.sendMessage(message.chat.id,`📤 Выберите платежную систему на которую хотите совершить вывод средств.

💵 Минимальная сумма зависит от платёжной системы, после нажатия кнопки мы выведем вам весь баланс!

ДЛЯ ВЫВОДА QIWI /qiwi`, {
				reply_markup: {
inline_keyboard: [
							[{ text: "▪ Payeer Кошелёк", callback_data: `payeerviv` }],
							[{ text: "▪ Банковская карта", callback_data: `bankviv` }]
						]
				}
			});
		}
		
		if(query.data.startsWith("popol")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
				return bot.sendMessage(message.chat.id,`📤 Выберите платежную систему на которую хотите совершить пополнение средств.

▪Моментальные зачисление на платёжные системы Qiwi и Payeer.
Пополнение банковской картой обрабатывается до 1 часа.`, {
				reply_markup: {
inline_keyboard: [
							[{ text: "▪ QIWI Кошелёк", callback_data: `qiwipopol` }],
							[{ text: "▪ Payeer Кошелёк", callback_data: `payeerpopol` }],
							[{ text: "▪ Банковская карта", callback_data: `bankpopol` }]
						]
				}
			});
		}
		if(query.data.startsWith("qiwipopol")) {
							if ((await bot.getChatMember("@SLIVMOSHENNIKOVV", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/SLIVMOSHENNIKOVV` }
						],
						]

			}
		});
	}
	return bot.sendMessage(message.user.id,`📥 Для совершения пополнения через QIWI кошелёк, переведите нужную сумму средств на номер кошелька указанный ниже, оставив при этом индивидуальный комментарий перевода:

💳 Номер кошелька бота: "+998994887316".
💬 Коментарий к переводу: "m${message.user.id}".
`);
}
		if(query.data.startsWith("payeerpopol")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
	return bot.sendMessage(message.user.id,`📥 Для совершения пополнения через Payeer Кошелёк, переведите нужную сумму средств на номер кошелька указанный ниже, оставив при этом индивидуальный комментарий перевода:

💳 Номер кошелька бота: "P1044812771".
💬 Коментарий к переводу: "p${message.user.id}".
`);
}
		if(query.data.startsWith("bankpopol")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
	return bot.sendMessage(message.user.id,`📥 Для совершения пополнения через Банковскую карту, переведите нужную сумму средств на номер карты указанный ниже, оставив при этом индивидуальный комментарий перевода:

💳 Номер карты бота: "4890 4946 9915 7889".
💬 Коментарий к переводу: "${message.user.id}". (если нету возможности то без комментария, после перевода писать @m5invadmin) 
`);
}
if(query.data.startsWith("qiwiviv")) {
							if ((await bot.getChatMember("@SLIVMOSHENNIKOVV", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/SLIVMOSHENNIKOVV` }
						],
						]

			}
		});
	}
	
	
	
	if (message.user.balance < 5) return bot.answerCallbackQuery(query.id, '🚫 Минимальная сумма вывода: 5₽.', true);
					let ticket = new Ticket({
					owner: message.user.id,
					wallet: `Qiwi`,
					amount: message.user.balance
					});
										await ticket.save();
					await User.findOneAndUpdate({ id: message.chat.id }, { $set: { balance: 0 } })
	return bot.sendMessage(message.user.id,`📥 Для подтверждения вывода напишите администратору @imgotit
1. Номер QIWI
2. Айди в боте

🧭 Вывод будет произведен от 1 минуты до 12 часов.
`);
}
if(query.data.startsWith("payeerviv")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
	if (message.user.balance < 10) return bot.answerCallbackQuery(query.id, '🚫 Минимальная сумма вывода: 10₽.', true);
					let ticket = new Ticket({
					owner: message.user.id,
					wallet: `Payeer`,
					amount: message.user.balance
					});
										await ticket.save();
					await User.findOneAndUpdate({ id: message.chat.id }, { $set: { balance: 0 } })
	return bot.sendMessage(message.user.id,`📥 Для подтверждения вывода напишите администратору @imgotit
1. Номер PAYEER
2. Айди в боте

🧭 Вывод будет произведен от 1 минуты до 12 часов.
`);
}
if(query.data.startsWith("bankviv")) {
							if ((await bot.getChatMember("@blogersz", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "Подписаться на канал", url: `t.me/blogersz` }
						],
						]

			}
		});
	}
	if (message.user.balance < 10) return bot.answerCallbackQuery(query.id, '🚫 Минимальная сумма вывода: 10₽.', true);
					let ticket = new Ticket({
					owner: message.user.id,
					wallet: `Банковская карта`,
					amount: message.user.balance
					});
										await ticket.save();
					await User.findOneAndUpdate({ id: message.chat.id }, { $set: { balance: 0 } })
	return bot.sendMessage(message.user.id,`📥 Для подтверждения вывода напишите администратору @imgotit
1. Номер банковской карты
2. Айди в боте

🧭 Вывод будет произведен от 1 минуты до 12 часов.
`);
}
	if(query.data.startsWith("skipChannel")) {
		let username	=	query.data.split("skipChannel-");
		let channel		=	await Channel.findOne({ username: username });

		if(!channel) return;
		channel.completed.push({ id: message.user.id, time: Date.now(), unfollow: true });

		await channel.save();
		return bot.editMessageText(`Вы пропустили этот канал.`, {
			chat_id: message.chat.id,
			message_id: message.message_id
		});
	}
	if(query.data.startsWith("subchek")) {
		if ((await bot.getChatMember("@m5pays", message.chat.id)).status == "left" || (await bot.getChatMember("@m5chats", message.chat.id)).status == "left"|| (await bot.getChatMember("@eaarning_money", message.chat.id)).status == "left") {
		
		return bot.sendMessage(message.chat.id,`▪ Для начала работы с ботом, пройдите небольшую проверку, просто вступите в чаты и вы сможете пользоваться ботом.`);
		}
		await User.findOneAndUpdate({ id: message.chat.id }, { $set: { dos: 1 } })
		await bot.sendMessage(message.chat.id, `✅ Вы подписались на каналы, доступ открыт.`);
		
		}

	if(admins.indexOf(message.user.id) !== -1) {
		if(query.data.startsWith("sponsorGive")) {
			let id			=		Number(query.data.split("sponsorGive")[1]);
			let user		=		await User.findOne({ id: id });

			await user.inc("balance", 2);
			bot.sendMessage(id, `✅ Вы выполнили спонсорское задание и получили 2 рубля на баланс.`);

			let completed	=		new Youtube({ id: id });
			await completed.save();

			return bot.answerCallbackQuery(query.id, "Готово.");
		}

		if(query.data.startsWith("sponsorDeny")) {
			let id			=		Number(query.data.split("sponsorDeny")[1]);
			bot.sendMessage(id, `❌ Вы выполнили спонсорское задание неверно!`);

			return bot.answerCallbackQuery(query.id, "Готово.");
		}

		if(query.data.startsWith("withdraw")) {
			let id			=		Number(query.data.split("withdraw")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			bot.sendMessage(ticket.owner, "Деньги выплачены. Просим прислать скриншоты в чат t.me/m5chats");
			bot.sendMessage("@m5pays", `<b>Была произведена новая выплата!</b>
			
💰 <b>Сумма: ${ticket.amount}₽</b>
💸 <a href="tg://user?id=${ticket.owner}">Пользователь</a>
`, {
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
					[
						{ text: "💰 Перейти в бота", url: `https://t.me/MoneyInv5Bot` }
					]
					]
				}
			});


			await ticket.remove();
			bot.editMesssageText("Деньги выплачены. Просим прислать скриншоты в чат t.me/m5chats", {
				chat_id: message.chat.id,
				message_id: message.message_id
			});

			return;
		}

		if(query.data.startsWith("declineback")) {
			let id			=		Number(query.data.split("declineback")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			await bot.sendMessage(ticket.owner, "Вам отклонили выплату и вернули деньги.");
			await User.findOne({ id: id }).then(async (user) => await user.inc("balance", ticket.amount));

			await ticket.remove();
			await bot.answerCallbackQuery(query.id, "Вы отказали в выплате средств и вернули деньги на баланс.");
		}

		if(query.data.startsWith("decline")) {
			let id			=		Number(query.data.split("decline")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			await ticket.remove();
			await bot.answerCallbackQuery(query.id, "Вы отказали в выплате средств.");
		}
	}
});

User.prototype.inc		=		function(field, value = 1) {
	this[field] 		+=		value;
	return this.save();
}

User.prototype.dec 		= 		function(field, value = 1) {
	this[field] 		-= 		value;
	return this.save();
}

User.prototype.set 		= 		function(field, value) {
	this[field] 		=	 	value;
	return this.save();
}

setInterval(async () => {
	await writeStrikes();
}, 600000);

async function rupdate() {
  let userList = await User.find();
await userList.map(async (x) => {
	  if (x.invests === 0) { return
  }
	await bot.sendMessage(x.id, "Прошло 24 часа и вы получили 5% от инвестиций.");
await User.updateOne({ id: x.id }, { $inc: { balance: x.invests/40, epv: x.invests/40 } }, 
  function (err) {
     if (err) throw err
})
 })
}


setInterval(async() => {
  rupdate(); 
}, 86400000); 

async function writeStrikes() {
	let channels = await Channel.find();
	await channels.map(async (x) => {
		x.completed.filter((a) => Date.now() < 604800000 + a.time && !a.unfollow).map(async (a) => {
			let unfollow = await Unfollow.findOne({ id: a.id, username: x.username });
			if(unfollow) return;

			let res = await bot.getChatMember("@" + x.username, a.id).catch((err) => console.error(err.response.body));

			if(res.status !== "left") return;
			let user = await User.findOne({ id: a.id });

			await user.dec("balance", 1);
			bot.sendMessage(a.id, `⚠️ Вы отписались от канала @${x.username} и получили штраф (1 рубль)`);

			let _unfollow = new Unfollow({ id: a.id, username: x.username });
			await _unfollow.save();
		});
	});

	return true;
}