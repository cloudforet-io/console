<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card class="base summary border-top-0">
        <slot name="header"/>
        <slot name="contents"/>
        <slot name="footer"/>

        <tempate v-if="!useSlot">
          <div class="alert tab-content-detail-warning" id="server-summary-warning-linux">
            <h4>
                <b class="text-primary">
                  <i :class="selectIconHtml(noticePanelData.header.icon, true)"></i>{{noticePanelData.header.text}}
                </b>
            </h4>
            <div class="mt-15 tab-content-detail-warning-msg">
              <template v-for="(opt, idx) in noticePanelData.contents">

              </template>
              1. 네트워크 ACL에서 <span class="text-pink"><b>SSH (TCP 22)</b></span> 및 <span class="text-pink"><b>ICMP</b></span> 포트 오픈 확인
              <br> 2. 클라우드 인스턴스 인 경우 Security Group 추가 확인
              <br> 3. 사내 LDAP 연동 또는 리눅스 계정(<span class="text-pink"><b>sdiadmin</b></span>) 생성
              <br> 4. SUDO NOPASSWD 권한 설정
              <br> 5.
              <label class="label label-inverse">Actions &gt; Collect Info</label> 버튼 클릭 후 Linux Collector 실행
              <br> 6. 리눅스 수집 실패 시 COMMAND 탭에서 로그 확인 (<a href="javascript:void(0)">수집 실패 원인</a>)

              <div class="mt-15">
                <b class="mr-10">수집 관련 문의:</b> sdi-dev@ncsoft.com
              </div>

            </div>
          </div>
        </tempate>


      </b-card>
    </b-col>
  </div>
</template>

<script>
export default {
    name: 'BaseNoticePanel',
    props: {
        useSlot: {
            type: Boolean,
            default: false
        },
        noticePanelData: {
          type: Object,
          default: () => {}
        },
    },
    methods: {

    }
};
</script>

<style lang="scss" scoped>
  .data-content-tab .tab-content-detail .alert {
    margin: 10px;
  }

  .data-content-tab .tab-content-detail div {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .data-content-tab .tab-content-detail-warning-msg {
    line-height: 180%;
  }
  .text-pink {
    color: #f76397;
  }
  .label-inverse {
    background-color: #4c5667;
  }
</style>
