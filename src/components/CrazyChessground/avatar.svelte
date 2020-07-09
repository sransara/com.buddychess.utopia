<script lang="typescript">
  export let icon: string; //"elephant" | "giraffe" | "monkey" | "rabbit"
</script>

<style>
  .elephant {
    background-image: url("./avatars/elephant.svg");
  }

  .giraffe {
    background-image: url("./avatars/giraffe.svg");
  }

  .monkey {
    background-image: url("./avatars/monkey.svg");
  }

  .rabbit {
    background-image: url("./avatars/rabbit.svg");
  }
</style>

<span class="h-full w-full bg-cover inline-block {icon}"></span>
