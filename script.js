const colors = [
    '#4a0206', '#710006', '#bb0d1a', '#fa6632', '#cf0638', '#ef3e4d', '#fdbbc1'
];

const TWO_PI = Math.PI * 2;

function lerp(value, min, max) {
    return min + value * (max - min);
}

function map(value, inMin, inMax, outMin, outMax) {
    return lerp(normalize(value, inMin, inMax), outMin, outMax);
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function fill(size, fn) {
    return [...Array(size)].map((undef, i) => fn(i));
}

function random(min, max) {

    if (arguments.length == 0) {
        return Math.random();
    }

    if (Array.isArray(min)) {
        return min[Math.floor(Math.random() * min.length)];
    }

    if (typeof min == 'undefined') min = 1;
    if (typeof max == 'undefined') max = min || 1, min = 0;

    return min + Math.random() * (max - min);
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function toRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

class Light {

    constructor({
        position = { x: 0, y: 0 },
        radius,
        color = '#FFFFFF',
        alpha = 0.5,
        softness = 0.1,
        twinkle = false
    } = {}) {

        this.graphics = document.createElement('canvas').getContext('2d');
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.alpha = alpha;
        this.softness = softness;

        this.twinkle = random() > 0.7 ? false : {
            phase: random(TWO_PI),
            speed: random(0.002, 0.004)
        };

        this.render();
    }

    get canvas() {
        return this.graphics.canvas;
    }

    render() {

        const { graphics, radius, color, alpha, softness } = this;
        const [r, g, b] = toRGB(color);
        const gradient = graphics.createRadialGradient(0, 0, radius, 0, 0, 0);

        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(softness, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},${alpha})`);

        this.canvas.width = radius * 2.1
        this.canvas.height = radius * 2.1;

        graphics.translate(radius, radius);
        graphics.beginPath();
        graphics.arc(0, 0, radius, 0, TWO_PI);
        graphics.fillStyle = gradient;
        graphics.fill();
    }

    update(time) {

        if (!this.twinkle) return;

        const { phase, speed } = this.twinkle;
        const theta = phase + time * speed;
        const value = normalize(Math.sin(theta), -1, 1);

        this.twinkle.scale = lerp(value, 0.98, 1.02);
        this.twinkle.alpha = lerp(value, 0.1, 1);
    }

    draw(context) {

        context.save();
        context.translate(this.position.x, this.position.y);

        if (this.twinkle) {
            const { scale, alpha } = this.twinkle;
            context.scale(scale, scale);
            context.globalAlpha = alpha;
        }

        context.drawImage(this.canvas, -this.radius, -this.radius);
        context.restore();
    }
}

class Background {

    constructor({ baseColor = '#0C0000' } = {}) {
        this.baseColor = baseColor;
        this.graphics = document.createElement('canvas').getContext('2d');
        this.render();
    }

    get canvas() {
        return this.graphics.canvas;
    }

    render() {

        const width = window.innerWidth;
        const height = window.innerHeight;
        const centerY = height / 2;
        const count = Math.floor(0.05 * width);
        const context = this.graphics;

        context.canvas.width = width;
        context.canvas.height = height;
        context.globalCompositeOperation = 'lighter';
        context.beginPath();
        context.fillStyle = this.baseColor;
        context.fillRect(0, 0, width, height);

        for (let i = 0; i < count; i++) {

            const light = new Light({
                radius: random(200, 400),
                alpha: random(0.01, 0.05),
                color: random(colors),
                softness: random(0.25, 0.9)
            });

            context.drawImage(
                light.canvas,
                random(width) - light.radius,
                centerY - light.radius + random(-200, 200)
            );
        }
    }

    draw(context) {
        context.drawImage(this.canvas, 0, 0);
    }
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.body.appendChild(canvas);

const background = new Background();

let lights = [];

function draw(time) {

    const { width, height } = canvas;

    context.save();
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';

    background.draw(context);

    lights.forEach(light => {
        light.update(time);
        light.draw(context);
    });

    context.restore();
    requestAnimationFrame(draw);
}

function resize(event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function reset() {

    const { width, height } = canvas;
    const count = Math.floor(width * 0.1);
    const theta = random(TWO_PI);
    const amplitude = height * 0.08;
    const cx = width / 2;
    const cy = height / 2;

    lights = fill(count, i => {

        const percent = (i / count);
        const x = percent * width;
        const distanceToCenter = 1 - Math.abs(cx - x) / cx;
        const varianceRange = lerp(distanceToCenter, 50, 200);
        const variance = random(-varianceRange, varianceRange);
        const offset = Math.sin(theta + percent * TWO_PI) * amplitude + variance;
        const y = cy + offset;

        return new Light({
            position: { x, y },
            radius: random(25, Math.max(1, 80 * distanceToCenter)),
            color: random(colors),
            alpha: random(0.05, 0.6),
            softness: random(0.02, 0.5)
        });
    });
}

function init() {
    resize();
    reset();
    requestAnimationFrame(draw);
}

init();

/* cal */

$(document).ready(function() {

    var words = ["??? Hallom, a l??nyod heged??lni tanul. Na ??s, hogy halad? </br> ??? Nagyon j??l. Neki k??sz??nhetem, hogy megvehettem a szomsz??d h??zat f??l??ron.",
    "??? Mi??rt vigyorog a kerti t??rpe? </br> ??? ??? </br> ??? Mert csiklandozza a segg??t egy f??sz??l.",
    "??? Hogy h??vj??k a r??szeg migr??nst? </br>  ??? Bet??ntorg??.",
    "??? Szomsz??d, haszn??lhatn??m a f??ny??r??j??t? </br> ??? Persze, csak ne vigye ki a kertemb??l???",
    "- Mennyibe ker??l ez a kutya? </br> ??tezer forintba. </br> - ??s h??s??ges fajta? </br>  - Meghiszem azt! M??r vagy ??tsz??r eladtam, ??s reggelre mindig visszaj??tt!",
    "K??t vad??sz besz??lget az erd??ben:  </br>  - Ha ??n megc??lzok egy nyulat, az m??ris ??rhatja a v??grendelet??t!  </br>  A tiszt??son hirtelen felt??nik a tapsif??les. A henceg?? vad??sz el??kapja a pusk??j??t, r??l??, de a ny??l elszalad.  </br>  Mire a m??sik ep??sen megjegyzi:  </br> - ??gy l??tom m??r szalad is a k??zjegyz??h??z...",
    "Eb??d ut??n a sk??t megk??rdezi a pinc??rt: </br>     - Iszik? </br>     - Soha! </br>     - Akkor nem is adok borra-val??t!", 
    "- Apu! Nem l??ttad a k??nyvemet a hossz?? ??let  titk??r??l? </br>     - El??gettem. </br>     - Micsoda? M??gis, hogy k??pzelted? </br>     - Az any??som nagyon olvasgatta mostan??ban...",
    "A f??rfi sz??guldozik az ??j sportaut??j??val. Egyszer csak egy rend??r meg??ll??tja, ??s megk??rdi t??le:  </br>    ???  Nem l??tta a sebess??gkorl??toz?? t??bl??t?  </br>   ??? Mi??rt biztos ??r, ??? k??rdezi megd??bbent tekintettel a f??rfi, egy hatalmas csukl??s kis??ret??ben ??? Csak nem ellopta valaki?",
    "Any??s a vej??nek: </br>     - Mi??rt hozt??l vatt??t a n??vnapomra, fiam? </br>     - Mi??rt, nem f??lbeval??t k??rt, mama?",
    "Annyit olvastam az alkohol ??s a doh??nyz??s k??ros hat??s??r??l, hogy elhat??roztam, abbahagyom az olvas??st!",
    "A feles??g egy ismer??s arcot vesz ??szre az ??tteremben. Odasz??l a f??rj??nek:  </br>    - N??zd csak, ott az a r??szeges alak az el??z?? f??rjem! Mi??ta h??t ??ve elv??ltam t??le, egyfolyt??ban csak iszik, ??lland??an r??szeg!  </br>- Ez t??nyleg furcsa. - Ennyi ideig az??rt senki nem szokott ??nnepelni!",
    "??l egy rend??r a pizz??ri??ban, ??s k??r egy pizz??t.   </br>    - N??gyfel??, vagy nyolcfel?? v??gjam? - k??rdi a pizz??s.   </br>    - Azt hiszem, el??g lesz n??gyre, nyolc szeletet m??r biztos nem tudn??k megenni",
    "- Mi a k??l??nbs??g az any??s ??s a ceruzaelem k??z??tt?  </br>     - ??? </br>     - Az elemnek van pozit??v oldala is.",
    "- Rem??lem, fiam, nem r??gt??l be! </br>    - Honnan tudom, hogy r??szeg vagyok-e? </br>    - Ha majd a szomsz??d asztaln??l ??l?? k??t vend??get n??gynek l??tod, akkor r??szeg vagy!</br> - De apa, ott csak egy vend??g ??l!",
    "K??t rend??r bemegy a McDonald's-ba.   </br>    - K??r??nk k??t hamburgert!   </br>    - Fi??k, sajnos elfogyott a hamburger, pechetek van.   </br>    A k??t rend??r ??sszen??z, mire r??v??gja az egyik:   </br>  - Akkor k??r??nk k??t pecheteket!",
    "Any??sa temet??s??r??l ??rkezik haza a f??rj, amikor hatalmas vihar t??mad. D??r??g az ??g, vill??mlik, ??s a sz??l egy cserepet is a fej??re sodor a h??z tetej??r??l. A f??rj feln??z, j??l megszeml??li viharos ??gboltot ??s igy sz??l:    </br> - Na, ??gy l??tszik fel??rt!",
    "Egy r??szeg ember botork??l hazafel?? az utc??n. Meg??ll??tja az els?? j??r??kel??t:  </br>    - Eln??z??st! Nem tudja v??letlen??l, merre lakik a Kov??cs J??zsi? </br>  - De hiszen maga az!  </br>    - Azt ??n is tudom, csak azt nem, hogy hol lakom!",
    "K??t bar??t besz??lget: </br>      - K??pzeld, az ??jjel a te any??soddal ??lmodtam. </br>      - ??s mit mondott? </br>      - Semmit. </br>      - Akkor az nem ?? volt.",
    "Egy r??szeg ??l a kocsm??ban. K??r t??z felest ??s megissza. Ezut??n kilencet k??r, ??s azt is megissza. Azut??n 8, 7, majd hat felest h??z le egym??s ut??n, majd megsz??lal:</br> - Nem ??rtem... Egyre kevesebbet iszom, m??gis egyre r??szegebb vagyok!",
    "K??t bar??t besz??lget egym??ssal: </br>    - Mondd ??regem, hogy szokt??l le az alkoholr??l? </br>    - Musz??j volt, mert amikor r??szegen hazamentem, mindig dupl??n l??ttam az any??somat.",
    "- Mit mond a r??szeg focista?  </br>    - ???  </br>    - Ber??gtam!",
    "- Mi a k??l??nbs??g a k??s ??s az any??s nyelve k??z??tt? </br>         - ??? </br>         - A k??s egy id?? ut??n elkopik.",
    "- Mi??rt gy??l??lik a politikusok a Trabantot? </br>     - ??? </br>     - Mert korm??nyv??lt??s.",
    "- Te, engem mindig kiz??r az asszony a lak??sb??l, ha r??szegen megyek haza... Mit tegyek, nincs valami ??tleted?  </br>     - ??n azt szoktam csin??lni, hogy bekopogok, levetk??z??m, beadom a ruh??imat az ajt??n, ??s nincs az az asszony, aki hagyn??, hogy a f??rje meztelen??l ??csorogjon az utc??n. </br>  - Rendben, kipr??b??lom... </br>  Legk??zelebb mikor tal??lkoznak, megk??rdi a m??sik: </br>  - Nos, bev??lt a tervem? </br>  - H??t, csak r??szben... </br>  - Hogyhogy r??szben? </br>  - Bekopogtam, levetk??ztem, beadtam a ruh??imat az ajt??n, az becsuk??dott, ??m ekkor hirtelen bemondta egy hang:  </br>  De??k t??r k??vetkezik..."  
    ];

    var message = "";
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var scrolled = false;
    var timeDelay = 200;

    // function to reveal message
    var cardReveal = function() {
        $("#message").text(message).show();
    }

    //day=25; // uncomment to skip to 25

    // Only work in December
    if (month === 12) {
        // Loop through each calendar window
        $("li").each(function(index) {
            var adventwindow = index + 1;
            var item = $(this);

            // Open past windows
            if (day !== adventwindow && adventwindow < day) {
                window.setTimeout(function() {
                    item.children(".door").addClass("open");
                }, timeDelay);
            }

            // timeout offset for past window opening animation
            timeDelay += 100;

            // Add words so far to message variable
            if (adventwindow <= day) {
                var word = words[index];
                $(this).append('<div class="revealed">' + word + '</div>');
                message = message + " " + word;
            }

            // Add jiggle animation to current day window
            if (adventwindow === day) {
                $(this).addClass("current");
                $(this).addClass("jiggle");
            }

            // On clicking a window, toggle it open/closed and
            // handle other things such as removing jiggle and 25th
            $(this).on("click", function() {
                if (adventwindow <= day) {
                    $(this).children(".door").toggleClass("open");
                }

                $(this).removeClass("jiggle");

                // If 25th, can show the message
                if (day >= 25 && adventwindow === 25) {
                    messageReveal();

                    // Animate scroll to message if not already done
                    if (!scrolled) {
                        $('html, body').animate({
                            scrollTop: $("#message").offset().top
                        }, 2000);
                        scrolled = true;
                    }
                }
            });

        });

        // If beyond 24, show message
        if (day >= 26) {
            messageReveal();
        }

    }

});
