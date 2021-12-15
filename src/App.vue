<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex flex-col">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">
              Ticker
            </label>
            <div class="flex mt-1 relative rounded-md shadow-md">
              <input
                v-model="newTickerName"
                @keydown.enter="add(newTickerName)"
                @input="searchForSimilarTickers"
                :class="{ 'focus:border-red-500': isTickerExist }"
                type="text"
                name="wallet"
                id="wallet"
                class="
                  block
                  w-full
                  pr-10
                  border-gray-300
                  text-gray-900
                  focus:outline-none focus:ring-gray-500 focus:border-gray-500
                  sm:text-sm
                  rounded-md
                "
                placeholder="Example DOGE"
              />
              <button
                @click="add(newTickerName)"
                type="button"
                class="
                  inline-flex
                  items-center
                  py-2
                  px-4
                  border border-transparent
                  shadow-sm
                  text-sm
                  leading-4
                  font-medium
                  rounded-full
                  text-white
                  bg-gray-600
                  hover:bg-gray-700
                  transition-colors
                  duration-300
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  focus:ring-gray-500
                "
              >
                <icon-plus />
                Add
              </button>
            </div>
          </div>
          <p v-if="isTickerExist" class="text-xs text-red-500">
            This ticker already exists
          </p>
          <div class="my-2">
            <span
              v-for="key in keys"
              :key="key.Symbol"
              @click="add(key.Symbol)"
              class="
                py-0
                px-2
                mr-2
                text-sm
                cursor-pointer
                border border-transparent
                bg-gray-300
                rounded-full
                uppercase
                font-semibold
              "
              >{{ key.Symbol }}
            </span>
          </div>
        </div>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="flex justify-center items-center">
          <label
            for="filter"
            class="block text-sm font-medium text-gray-700 mr-2"
          >
            Filter
          </label>
          <input
            v-model="filter"
            type="text"
            id="filter"
            class="
              block
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
              shadow-md
            "
          />
        </div>
        <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in filteredTickers()"
            :key="ticker.name"
            @click="selectTicker(ticker)"
            :class="{ 'border-4': ticker == selectedTicer }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ ticker.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(ticker)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <icon-trash />
              Delete
            </button>
          </div>
        </div>
        <div class="flex my-5 justify-center items-center">
          <button
            type="button"
            @click="page--"
            :class="{ 'disabled:opacity-75': page == 1 }"
            class="
              mr-5
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Prev
          </button>
          <button
            type="button"
            @click="page++"
            :class="{ 'disabled:opacity-75': hasNextPage }"
            class="
              ml-5
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Next
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedTicer" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicer.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizaGraph()"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicer = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <icon-x-circle />
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import IconTrash from "./components/icons/Icon-trash.vue";
import IconPlus from "./components/icons/Icon-plus.vue";
import IconXCircle from "./components/icons/Icon-x-circle.vue";

export default {
  name: "App",

  components: {
    IconTrash,
    IconPlus,
    IconXCircle,
  },

  data() {
    return {
      newTickerName: "",
      tickers: [],
      selectedTicer: null,
      graph: [],
      cryptoList: [],
      keys: [],
      isTickerExist: false,
      filter: "",
      page: 1,
      hasNextPage: true,
    };
  },
  beforeCreate: function () {
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
      .then((response) => response.json())
      .then((data) => (this.cryptoList = Object.values(data.Data)));
  },
  created() {
    const tickerList = localStorage.getItem("crypto-list");
    if (tickerList) {
      this.tickers = JSON.parse(tickerList);
      this.tickers.forEach((ticker) => this.subscribeToUdate(ticker));
    }
  },

  methods: {
    searchForSimilarTickers() {
      this.isTickerExist = false;
      const filteredCrytoList = this.cryptoList.filter((e) =>
        e.FullName.toLocaleUpperCase().includes(
          this.newTickerName.toUpperCase()
        )
      );
      this.keys = filteredCrytoList.slice(0, 10);
    },

    subscribeToUdate(ticker) {
      setInterval(async () => {
        const f = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${ticker.name}&tsyms=USD`
        );

        const data = await f.json();
        ticker.price = data.USD;

        if (this.selectedTicer.name == ticker.name) {
          this.graph.push(data.USD);
        }
      }, 10000);
    },

    filteredTickers() {
      const first = (this.page - 1) * 6;
      const last = this.page * 6;

      const filteredTickers = this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
      this.hasNextPage = filteredTickers.length > last;
      return filteredTickers.slice(first, last);
    },

    add(tickerName) {
      tickerName = tickerName.toUpperCase();

      if (this.tickers.some((e) => e.name == tickerName)) {
        this.isTickerExist = true;
        this.ticker = tickerName;
        return;
      }

      const newTicker = {
        name: tickerName,
        price: "-",
      };

      this.tickers.push(newTicker);
      localStorage.setItem("crypto-list", JSON.stringify(this.tickers));

      this.subscribeToUdate(newTicker);
      this.newTickerName = "";
      this.filter = "";
    },

    selectTicker(ticker) {
      this.selectedTicer = ticker;
      this.graph = [];
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      if (tickerToRemove == this.selectedTicer) {
        this.selectedTicer = null;
      }
    },

    normalizaGraph() {
      if (!this.graph.length) return;
      const maxPrice = Math.max(...this.graph);
      const minPrice = Math.min(...this.graph);

      if (this.graph.length == 1 || maxPrice == minPrice) {
        return this.graph.map(() => 50);
      } else {
        return this.graph.map((price) => {
          if (price == minPrice) {
            return 5;
          } else if (price == maxPrice) {
            return 95;
          } else {
            return ((price - minPrice) * 95) / (maxPrice - minPrice);
          }
        });
      }
    },
  },

  watch: {
    filter() {
      this.page = 1;
    },
  },
};
</script>
