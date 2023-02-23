<script>
  import Avatar from "../assets/avatar.png"
</script>

<style>
  .header {
    position: fixed;
    top: 1em;
    width: 98%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    color: #000;
  }

  .profile {
    height: 50px;
    width: 50px;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .avatar {
    width: 95%;
    height: 95%;
  }
</style>

<div class="header">
  <div class="profile"><img class="avatar" src={Avatar} alt="Avatar" /></div>
</div>
