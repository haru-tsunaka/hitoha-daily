import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-serif text-navy text-xl font-bold tracking-wider mb-6">
        プライバシーポリシー
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-border space-y-5 text-sm text-brand-text/80 leading-relaxed">
        <p>
          繋叶（以下「当サービス」）は、Hitoha Daily の運営にあたり、個人情報の重要性を認識し、適切な保護と取り扱いを徹底いたします。
        </p>

        <section>
          <h2 className="font-bold text-navy mb-1">1. 取得する情報</h2>
          <p>当サービスでは、以下の情報を取得いたします。</p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>メールアドレス（アカウント登録・ログインに使用）</li>
            <li>パスワード（暗号化して保存）</li>
            <li>日々の目標・タスク・振り返りなどの記録データ</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">2. 利用目的</h2>
          <p>取得した情報は、以下の目的で利用いたします。</p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            <li>サービスの提供・運営</li>
            <li>ユーザーへのご連絡・ご案内</li>
            <li>サービス改善のための分析</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">3. データの保管</h2>
          <p>
            ユーザーの情報は、クラウドサービス（Supabase）上に安全に保管されます。不正アクセス・漏洩等の防止に努めます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">4. 第三者提供について</h2>
          <p>
            ご本人の同意がある場合、または法令に基づく場合を除き、第三者に個人情報を開示・提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">5. 退会・データ削除</h2>
          <p>
            アカウントの削除およびデータの消去をご希望の場合は、下記のお問い合わせ窓口までご連絡ください。速やかに対応いたします。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">6. 免責事項</h2>
          <p>
            当サービスからリンクされた外部サイトで提供される情報・サービス等については、一切責任を負いかねます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">7. ポリシーの変更</h2>
          <p>
            本ポリシーの内容は、法令その他別段の定めのある事項を除き、ユーザーに通知することなく変更できるものとします。変更後のポリシーは、本サービス上に掲載したときから効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-navy mb-1">8. お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、下記までご連絡ください。
          </p>
          <p className="mt-1">
            メール：<a href="mailto:info@tsuna-ka.com" className="underline hover:text-navy transition-colors">info@tsuna-ka.com</a>
          </p>
        </section>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-xs text-brand-muted hover:text-navy transition-colors"
        >
          ログインに戻る
        </Link>
      </div>
    </div>
  );
}
