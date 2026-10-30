/*
=========================
DECLARATION DES VARIABLES
=========================
*/
let DATAS_PRODUITS =  null;

// Conteneurs et éléments du DOM utilisés dans le script
const produits = document.querySelector("#produits");
const nb_articles = document.querySelector("#nb_articles"); 
const btn_panier = document.querySelector("#btn_panier");
const modal_commande = document.querySelector("#modal_commande"); 
const liste_produits = document.querySelector("#liste_produits"); 
const total_commande = document.querySelector("#total_commande"); 
const btn_valider = document.querySelector("#btn_valider"); 
const confirmation = document.querySelector("#confirmation"); 

/*
=========================
QUELQUES FONCTIONS UTILES
=========================
*/

// Charge les produits depuis le fichier data/produits.json.
// Fonction asynchrone : on attend (await) la réponse du serveur.
// En cas d'erreur (fichier manquant, réseau...), on affiche un message dans #produits.
async function chargerProduits() {
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

// Affiche la liste des produits dans le conteneur #produits.
// Si la liste est vide ou nulle, on affiche un message "Aucun produit trouvé".
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
        // On parcourt chaque produit et on génère sa carte HTML
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

// Recherche un produit par son id dans une liste et le retourne.
// Retourne undefined si aucun produit ne correspond.
function rechercheProduit(id, liste){
    return liste.find(function(val){
        return val.id == id
    });
}

// Supprime un produit d'une liste à partir de son id.
// Retourne une NOUVELLE liste sans le produit concerné.
function supprimerProduit(id, liste){
    return liste.filter(function(val){
        return val.id != id
    });
}



// Initialise (ou rafraîchit) le panier :
//  - met à jour le compteur d'articles dans l'entête
//  - remplit le tableau récapitulatif de la modal
//  - calcule et affiche le total
function initPanier(){
    const panier = localStorage.getItem("panier");
    liste_produits.innerHTML = "";
    total_commande.textContent = "";

    if(panier != null){
        nb_articles.classList.remove('hide');
        let liste = JSON.parse(panier);
        nb_articles.textContent = liste.length;

        let total = 0;
        // On parcourt chaque produit du panier pour construire une ligne du tableau
        for(let i = 0; i< liste.length; i++){
            const produit = liste[i];
            liste_produits.innerHTML += `
                <tr class = "ligne_produit" data-id = "${produit.id}">
                    <td>${produit.nom}</td>
                    <td>${produit.prix}</td>
                    <td>${produit.qte}</td>
                    <td>${produit.prix * produit.qte}</td> 
                    <td class = "options">
                        <span data-id = "${produit.id}" class = "delete">
                            <i class = "fa fa-trash"></i>
                        </span>
                    </td>
                </tr>
            `;

            //Calcul du total
            total = total + (produit.prix * produit.qte);
        }

        //Affichage du total
        total_commande.textContent = `TOTAL : ${total} FCFA`;
    }
    else{
        // Panier vide : on cache le badge et on met le compteur à 0
        nb_articles.textContent = 0;
        nb_articles.classList.add('hide');
    }
}

// Ajoute un produit au panier stocké dans le localStorage.
// Si le produit existe déjà, on prévient l'utilisateur par une alerte.
function ajoutProduitPanier(produit){
    const panier = localStorage.getItem("panier");

    if(panier != null){
        let liste = JSON.parse(panier);
        let data = rechercheProduit(produit.id, liste);

        if(data == null){
            liste.push(produit);
            localStorage.setItem("panier", JSON.stringify(liste));
        }
        else{
            alert("Ce produit se trouve déjà dans le panier.");
        }
    }
    else{
        // Premier ajout : on crée le panier avec ce produit
        let liste = [produit];
        localStorage.setItem("panier", JSON.stringify(liste));
    }

    initPanier();
}

// Supprime un produit du panier à partir de son id, puis rafraîchit l'affichage.
function supprimerProduitPanier(id){
    const panier = localStorage.getItem("panier");
    if(panier == null) { return; }

    let liste = JSON.parse(panier);
    liste = supprimerProduit(id, liste);

    // Si le panier devient vide, on supprime complètement la clé du localStorage
    if(liste.length == 0){
        localStorage.removeItem("panier");
    }
    else{
        localStorage.setItem("panier", JSON.stringify(liste));
    }

    initPanier();
}

/*
=========================
CHARGEMENT DES PRODUITS
=========================
*/

// Point d'entrée : initialise le panier depuis le localStorage,
// charge les produits depuis le JSON et les affiche.
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

// Gère tous les clics dans la zone produits (boutons +, -, ajouter, détail).
produits.addEventListener("click", function(e){
    const element = e.target.closest('[data-action]');
    if(element == null) { return; }
    
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

// Evenement de click sur le bouton du panier : ouvre la modal après avoir rafraîchi son contenu.
btn_panier.addEventListener("click", function(e){
    e.preventDefault();
    initPanier();
    modal_commande.classList.remove("hide");
});

// Evenement de click sur la modal (popoup) : gère la fermeture, la suppression et la validation.
modal_commande.addEventListener("click", function(e){
    e.preventDefault();

    //Fermer le popoup
    if(e.target.closest('#modal_fermer') != null){
        modal_commande.classList.add("hide");
    }

    //Supprimer un produit du panier
    if(e.target.closest('.delete') != null){
        const ligne = e.target.closest('.ligne_produit');
        const id = ligne.dataset.id;
        supprimerProduitPanier(id);
    }

    //Evenement de click pour confirmé la commande
    if(e.target.closest('#btn_valider') != null){
        confirmation.classList.remove('hide');
        confirmation.textContent = "Votre commande a été validée avec succès";

        // Ferme automatiquement la modal après 5 secondes
        setTimeout(function(){
            modal_commande.classList.add('hide');
        }, 5000);
    }
});


initBoutique();