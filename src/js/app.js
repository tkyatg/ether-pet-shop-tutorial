App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // ペットの情報をロードします。
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-adopt").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // DAppを使用できるブラウザーか確認する
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // アカウントへのアクセス要求
        await window.ethereum.enable();
      } catch (error) {
        // ユーザーがアカウントのアクセスを拒否しました
        console.error("User denied account access");
      }
    }
    // Web3プロバイダーのウィンドウを開く
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // もし挿入されたWeb3インスタンスが検出されない場合は、Ganacheに戻します
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Adoption.json", function (data) {
      //必要なContract Artifactファイルを取得し、@truffle/contractでインスタンス化します
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // コントラクトの為にプロバーダーを設定します
      App.contracts.Adoption.setProvider(App.web3Provider);

      // データ取得と受け取ったペットをマーキングする為にコントラクトを使用します
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
  },

  markAdopted: function (adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".panel-pet")
              .eq(i)
              .find("button")
              .text("Success")
              .attr("disabled", true);
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // アカウントを送信してデータ取得としてのトランザクションを実行します
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
