/*
=========================
DECLARATION DES VARIABLES
=========================
*/
let DATAS_PRODUITS =  null;
const produits = document.querySelector("#produits");
const nb_articles = document.querySelector("#nb_articles"); 

/*
=========================
QUELQUES FONCTIONS UTILES
=========================
*/
//Chargement des produits depuis le fichier json.
async function chargerProduits() {  //Dans une fonction asynchronne, il y'a tjr un await.
    try{
        const response = await fetch("data/produits.json");
        if(!response.ok){
            throw new Error("Fichier data/produits.json introuvable");
        }

        const datas = await response.json();
        return datas;
    }
    catch(erreur){
        console.error(erreur);
        produits.innerHTML = `
            <p class = "danger">
                Impossible de charger les produits.
            </p>
        `;
    }
}

//Afficher les produits
function afficherProduits(liste){
    if(liste == null || liste.length == 0){
        produits.innerHTML = `
            <p class = "message">
                <i class = "fa-solid fa-magnifying-glass"></i>
                Aucun produit trouvé
            </p>
        `;
    }
    else{
        produits.innerHTML = "";
        for(let i = 0; i < liste.length; i++){
            const produit = liste[i];
            const html = `
                <div class = "produit">
                    <div class = "produit_icon" data-action = "detail" data-id = "${produit.id}">
                        <i class = "${produit.icon}"></i>
                    </div>
                    <div class = "produit_texte">
                        <span class = "produit_categorie">${produit.categorie}</span>
                        <h3 data-action = "detail" data-id = "${produit.id}"> ${produit.nom} </h3>
                        <p class = "produit_unite">${produit.unite}</p>
                        <p class = "produit_prix">${produit.prix} FCFA</p>

                        <div class = "produit_footer">
                            <div class = "produit_qte" data-stock = "${produit.stock}">
                                <span data-action = "moins" data-id = "${produit.id}">-</span>
                                <b class = "produit_qteCommande"> 1 </b>
                                <span data-action = "plus" data-id = "${produit.id}">+</span>
                            </div>
                            <button data-action = "ajouter" data-id = "${produit.id}">
                                <i class = "fa-solid fa-cart-shopping"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            produits.innerHTML += html;
        }
    }
}

//Retourne un produit à partir de son id
function rechercheProduit(id, liste){
    return liste.find(function(val){
        return val.id == id
    })
}

//Initialisation du panier
function initPanier(){
    const panier = localStorage.getItem("panier");

    if(panier != null){
        nb_articles.classList.remove('hide');
        let nb = JSON.parse(panier).length;
        nb_articles.textContent = nb;
    }
    else{
        nb_articles.textContent = 0;
        nb_articles.classList.add('hide');
    }
}

//Ajout d'un produit dans le panier
function ajoutProduitPanier(produit){
    const panier = localStorage.getItem("panier");

    if(panier != null){
        let liste = JSON.parse(panier);
        let data = rechercheProduit(produit.id, liste);

        if(data == null){
            liste.push(produit);
            localStorage.setItem("panier", JSON.stringify(liste));  //stringify permet de convertir le tableau en JSON.
        }
        else{
            alert("Ce produit se trouve déjà dans le panier.");
        }
    }
    else{
        let liste = [produit];
        localStorage.setItem("panier", JSON.stringify(liste));
    }

    initPanier();
}

/*
=========================
CHARGEMENT DES PRODUITS
=========================
*/
async function initBoutique(){
    initPanier();   //On appele initPanier ici parceque l'on veut que lorsque l'on actualise la page, les produits restent tjr dans le panier.
    DATAS_PRODUITS = await chargerProduits();
    console.log(DATAS_PRODUITS);
    afficherProduits(DATAS_PRODUITS);
}


/*
=========================
GESTION DES EVENEMENTS
=========================
*/
produits.addEventListener("click", function(e){
    const element = e.target.closest('[data-action]');
    
    //Décrémentation de la quantité d'un produit.
    if(element.matches('[data-action = "moins"]')){
        const bloc = element.parentNode.querySelector('b');

        if(parseInt(bloc.textContent) > 1){
            bloc.textContent = parseInt(bloc.textContent) - 1;
        }
    }

    //Incrémentation de la quantité d'un produit.
    if(element.matches('[data-action = "plus"]')){
        const bloc = element.parentNode.querySelector('b');
        const stock = element.parentNode.dataset.stock;

        if(parseInt(bloc.textContent) < stock){
            bloc.textContent = parseInt(bloc.textContent) + 1;
        }
    }

    //Incrémentation (ajout) d'un produit au panier.
    if(element.matches('[data-action = "ajouter"]')){
        const id = element.dataset.id;
        const qte = parseInt(element.parentNode.querySelector(".produit_qteCommande").textContent);
        let produit = rechercheProduit(id, DATAS_PRODUITS);

        if(produit != null){
            produit.qte = qte;
            ajoutProduitPanier(produit);
        }
        else{
            alert("Ce produit se trouve déjà dans le panier.");
        }
    }
});


initBoutique();