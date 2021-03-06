<template>
  <div>
    <transition name="slide" mode="out-in">
      <notification-toast class="notification-toast" :message="notification.message" v-if="notification.shouldShowNotification" :onClick="onBeritaSelected"></notification-toast>
    </transition>
    <nav-bar :toogleDrawer="toogleDrawer" :isLoggedIn="isLoggedIn"></nav-bar>
    <transition name="fade">
      <div class="container" v-if="isContentShown">
        <div class="content-container">
          <router-view></router-view>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import NavBar from "./ui/navigation/NavBar.vue";
import NotificationToast from "./ui/modals/NotificationToast.vue";
import {mapGetters} from 'vuex'
import openSocket from "socket.io-client";
import { BASE_URL } from '../../api/const.js';
//import LoginUser from "./LoginUser.vue";

const NOTIFICATION_TIME = 4000;

export default {
  created() {
    if (this.isLoggedIn && this.mostLikedCategory !== "") {
      this.initSocket();
    }
  },
  components: {
    NavBar,
    NotificationToast,
  },
  
  data() {
    return {
      isContentShown: true,
      socket: null,
      notification: {
        message: "",
        shouldShowNotification: false,
        beritaId: null,
      },
      notificationQueue: [],
      isAnimationWork: false,
    };
  },
  methods: {
    resetNotificatoin() {
      this.notification.message = "";
      this.notification.shouldShowNotification = false;
      this.notification.beritaId = null;
    },
    newNotification(message, beritaId) {
      this.notification.message = `${message}...`;
      this.notification.shouldShowNotification = true;
      this.notification.beritaId = beritaId;
      console.log(this.notification.shouldShowNotification && this.isFirstToast);
      setTimeout(() => {
        this.resetNotificatoin();
      }, NOTIFICATION_TIME);
    },
    queueNotification(message, beritaId) {
      if (this.notification.shouldShowNotification) {
        this.notificationQueue.push({ message, beritaId });
        console.log(this.notificationQueue);
      } else {
        this.newNotification(message, beritaId);
      }
    },
    toogleDrawer(isDrawerShown) {
      this.isContentShown = !isDrawerShown;
    },
    initSocket() {
      this.socket = openSocket.connect(BASE_URL);
      this.socket.emit("room", this.mostLikedCategory);
      this.socket.on("notification", (result) => {
        if (result.action === "publish") {
          const newsTitle = result.data.judul.slice(0, 50);
          const beritaId = result.data.id_berita;
          this.queueNotification(newsTitle, beritaId);
        }
      });
    },
    disconnectSocket() {
      this.socket.disconnect();
      this.socket = null;
    },
    onBeritaSelected() {
      console.log("routerpush");
      this.$router
        .push({
          name: "read-berita",
          params: { id: `${this.notification.beritaId}` },
        })
        .catch((err) => {
          err;
        });
      this.resetNotificatoin();
    },
  },
  computed: {
    ...mapGetters({
      isLoggedIn: "user/isLoggedIn",
      mostLikedCategory: "user/getMostLikedKategori",
    }),
    observableShouldShowNotification() {
      return this.notification.shouldShowNotification;
    },
  },
  watch: {
    isLoggedIn(value) {
      if (value) {
        console.log("login");
        this.initSocket();
      } else {
        console.log("dc socket");
        this.disconnectSocket();
      }
    },
    mostLikedCategory(value) {
      value;
      this.disconnectSocket();
      this.initSocket();
    },
    observableShouldShowNotification(value) {
      if (!value && this.notificationQueue.length > 0 && !this.isAnimationWork) {
        this.isAnimationWork = true;
        setTimeout(() => {
          this.isAnimationWork = false;
          const newNotification = this.notificationQueue.shift();
          this.newNotification(newNotification.message, newNotification.beritaId);
        }, 1200);
      }
    },
  },
  beforeDestroy() {
    this.disconnectSocket();
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@300&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Work Sans", sans-serif;
}

.container {
  display: flex;
  min-width: 100%;
  justify-content: center;
}
.content-container {
  padding: 10rem 1rem 0 1rem;
  width: 100%;
  max-width: 1488px;
}

.notification-toast {
  position: fixed;
  z-index: 300;
  bottom: 5%;
  right: 2%;
  background: red;
}

@media screen and (max-width: 960px) {
  .content-container {
    padding: 6rem 1rem 0 1rem;
  }
}

/* fade */
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  transition: opacity 1s;
}

.fade-leave-active {
  transition: opacity 1s;
  opacity: 0;
}

/*slide*/
.slide-enter {
  opacity: 0;
}

.slide-enter-active {
  animation: slide-in 0.5s ease-out forwards;
  transition: opacity 0.5s;
}

/* .slide-leave{
  } */

.slide-leave-active {
  animation: slide-out 0.5s ease-out forwards;
  transition: opacity 0.5s;
  opacity: 0;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
